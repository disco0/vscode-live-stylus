export type Not<T> = Exclude<any, T>;
export type Returns<R, A extends AnyArray = AnyArray> = (...any: A) => R;

//#region Array

export type AnyArray = any[];
export type NotArray = Exclude<any, AnyArray>;

export function ifArray<T, F, O extends AnyArray = AnyArray>(obj: O, isTrue: T, isFalse: F): T;
export function ifArray<T, F, O extends NotArray>(obj: O, isTrue: T, isFalse: F): F;
export function ifArray<T, F, O>(obj: O, isTrue: T, isFalse: F): T | F 
{ 
    if(Array.isArray(obj)) 
        return isTrue; 
    else
        return isFalse;
}

export function ifArrayThen<T, F, O extends AnyArray = AnyArray>(obj: O, isTrue: Returns<T>, isFalse: Returns<F>): T;
export function ifArrayThen<T, F, O extends NotArray>(obj: O, isTrue: Returns<T>, isFalse: Returns<F>): F;
export function ifArrayThen<T, F, O>(obj: O, isTrue: Returns<T>, isFalse: Returns<F>): T | F 
{ 
    if(Array.isArray(obj)) 
        return isTrue(); 
    else
        return isFalse();
}

//#endregion Array

//#region String

export function ifString<T, F, O extends string = string>(obj: O, isTrue: T, isFalse: F): T;
export function ifString<T, F, O extends Not<string>>(obj: O, isTrue: T, isFalse: F):     F;
export function ifString<T, F, O>(str: O, isTrue: T, isFalse: F): T | F
{ 
    if(typeof str === 'string')
        return isTrue; 
    else
        return isFalse;
}

export function ifStringThen<T, F, S extends string = string>(str: S, isTrue: Returns<T>, isFalse: Returns<F>): T;
export function ifStringThen<T, F, S extends Not<string>>(str: S, isTrue: Returns<T>, isFalse: Returns<F>): F;
export function ifStringThen<T, F, S>(str: S, isTrue: Returns<T>, isFalse: Returns<F>): T | F 
{ 
    if(typeof str === 'string')
        return isTrue(); 
    else
        return isFalse();
}

//#endregion String