const toString = ({}).toString;

export function isObject(obj: unknown): obj is Object
{
    // toString.call(obj) === "[object Object]"
    return obj instanceof Object
}
export function isFunction<T extends (...args: any[]) => any>(obj: unknown): obj is T
{
    // toString.call(obj) === "[object Function]"
    return typeof obj === 'function'
}
export function isString(obj: unknown): obj is string
{
    // toString.call(obj) === "[object String]"
    return typeof obj === 'string'
}
/**
 * Checks if `obj` is a `Number`—_does not check if `obj` is parseable as a `Number`_.
 */
export function isNumber(obj: unknown): obj is number
{
    // toString.call(obj) === "[object Number]"
    return !Object.is(undefined, obj) && Number.isNaN(obj)
}
export function isDate(obj: unknown): obj is Date
{
    // toString.call(obj) === "[object Date]"
    return obj instanceof Date
}
export function isRegExp(obj: unknown): obj is RegExp
{
    // toString.call(obj) === "[object RegExp]"
    return obj instanceof RegExp
}
export function isUndefined<T>(obj: T): obj is Exclude<T, undefined | null>
{
    return Object.is(undefined, obj)
}
export function isNull<T>(obj: T): obj is Exclude<T, null>
{
    return Object.is(null, obj)
}
export const isArray = Array.isArray
export function isDefined<T>(obj: T): obj is Exclude<T, undefined | null>
{
    return !(isUndefined(obj) || isNull(obj))
}

export const is =
{
    Function:  isFunction,
    Object:    isObject,
    String:    isString,
    Number:    isNumber,
    Date:      isDate,
    RegExp:    isRegExp,
    Defined:   isDefined,
    Undefined: isUndefined,
    Null:      isNull,
    Array:     isArray,
}

export default is;
