export class SingletonClass
{
    private static _instance: SingletonClass;

    public anyMetod(_value:any):any
    {
         return _value;
    }
    public static getInstance(): SingletonClass
    {
        if (SingletonClass._instance == null)
        {
            SingletonClass._instance = new SingletonClass();
        }
        return this._instance;
    }
    constructor()
    {
        if(SingletonClass._instance)
        {
            throw new Error("Error: Instantiation failed: Use SingletonClass.getInstance() instead of new.");
        }
    }
}