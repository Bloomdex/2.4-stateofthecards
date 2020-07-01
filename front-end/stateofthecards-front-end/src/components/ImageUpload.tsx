// Types are surpressed because the "filepond-plugin-file-validate-size" plugin does not define any types
//@ts-nocheck
import * as firebase from "firebase/app";
import "firebase/storage";

import * as React from "react";
import {
	FilePond,
	registerPlugin,
	FilePondServerConfigProps,
} from "react-filepond";
import FilePondPluginImageExifOrientation from "filepond-plugin-image-exif-orientation";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import FilePondPluginFileValidateSize from "filepond-plugin-file-validate-size";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import "filepond/dist/filepond.min.css";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
import FirebaseApp from "../config/Firebase";
import { v4 as uuid } from "uuid";

const registerPlugins = registerPlugin(
	FilePondPluginImageExifOrientation,
	FilePondPluginImagePreview,
	FilePondPluginFileValidateType,
	FilePondPluginFileValidateSize
);
const storage = FirebaseApp.storage().ref();

export function ImageUpload({
	onRequestSave,
	onRequestClear,
	gameIdentifier,
	previousFileName,
}: {
	onRequestSave: (source: string) => void;
	onRequestClear: () => void;
	gameIdentifier: string;
	previousFileName: string;
}) {
	// use a useState hook to maintain our files collection
	const defaultFiles: any[] = [
		{
			// the server file reference
			source: "games/placeholder-face.jpg",

			// set type to local to indicate an already uploaded file
			options: {
				type: "limbo",

				// mock file information
				file: {
					name: previousFileName,
					size: 1001025,
					type: "image/jpeg",
				},
			},
		},
	];
	const [files, setFiles] = React.useState(defaultFiles);

	const server: FilePondServerConfigProps["server"] = {
		// this uploads the image using firebase
		process: (fieldName, file, metadata, load, error, progress, abort) => {
			// create a unique id for the file
			const fileSource = `games/${gameIdentifier}/${uuid()}`;

			// upload the image to firebase
			const task = storage.child(fileSource).put(file, {
				contentType: "image/jpeg",
			});

			// monitor the task to provide updates to FilePond
			task.on(
				firebase.storage.TaskEvent.STATE_CHANGED,
				(snap) => {
					// provide progress updates
					progress(true, snap.bytesTransferred, snap.totalBytes);
				},
				(err) => {
					// provide errors
					error(err.message);
				},
				() => {
					// the file has been uploaded
					load(fileSource);

					storage
						.child(fileSource)
						.getDownloadURL()
						.then((url) => {
							onRequestSave(url);
						});
				}
			);
		},

		// this loads an already uploaded image to firebase
		load: (source, load, error, progress, abort) => {
			// reset our progress
			progress(true, 0, 1024);

			// fetch the download URL from firebase
			storage
				.child(source)
				.getDownloadURL()
				.then((url) => {
					// fetch the actual image using the download URL
					// and provide the blob to FilePond using the load callback
					let xhr = new XMLHttpRequest();
					xhr.responseType = "blob";
					xhr.onload = function (event) {
						let blob = xhr.response;
						load(blob);
					};
					xhr.open("GET", url);
					xhr.send();
				})
				.catch((err) => {
					error(err.message);
					abort();
				});
		},
	};

	return (
		<FilePond
			maxFileSize={"1MB"}
			acceptedFileTypes={["image/jpeg", "image/png", "image/gif"]}
			files={files}
			allowMultiple={false}
			maxFiles={1}
			onupdatefiles={(fileItems) => {
				if (fileItems.length === 0) {
					onRequestClear();
				}

				setFiles(fileItems.map((fileItem) => fileItem.file));
			}}
			server={server}
		/>
	);
}
