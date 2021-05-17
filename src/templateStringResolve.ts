///<reference lib="es2019.array"/>

//#region Util

const Identity = <V>(value: V): V => value;
type Identity  = typeof Identity;

const asString = (value: any): string => String(value);
type ToString  = (value: any) => string;

type ZipFunction<V = any, R = any> = (value: V) => R
/**
 * Merge values of two arrays with additional transform function, if supplied 
 */
function zipArray<T1, T2>(
    arr1: Array<T1>, 
    arr2: Array<T2>,
    fn1: ZipFunction<T1> = (value: T1) => value,
    fn2: ZipFunction<T2> = (value: T2) => value
  ) {
    return arr1.flatMap((item: T1, index: number) => [...[fn1!(item),  fn2!(arr2[index])]]);
}

//#endregion Util 

//#region Types

type TA = TemplateStringsArray; 

export type StringOrTemplateStringParams = 
    [String: TemplateStringsArray, ...Values: Array<any>]
    | [String: string];

export interface StringOrTemplateStringFunction
{
    (...args: StringOrTemplateStringParams): string
}

type Transformer = (value: any) => string
interface TransformerObject
{
    strings?: Transformer;
    values?: Transformer;
}

type TransformerTuple =
[
    strings: Transformer,
    values?: Transformer
] | [ ]

type TransformerArg = Transformer | TransformerObject | TransformerTuple

//#endregion Types

/**
 * Takes arguments from a template string function and returns the concatenated
 * form. Default return type is string, but can be manually specified.
 * @param base
 *   First argument of TemplateStringsArray from template string function.
 * @param values
 *   Values received in template string function after `base`, passed as a 
 *   single array of remaining parameters from template string function
 *   arguments, like so:
 * ``` ts
 * let exampleTemplate = (base, ...values: any[]) => reduceTemplateString(base, values)
 * ``` 
 * @param valueTransformer
 *   A function that receives each element from `values` with any required
 *   additional processing.
 */
export function reduceTemplateString<V>(strings: TA, values: V[], valueTransformer?: TransformerArg): string;
export function reduceTemplateString<V>(strings: TA, values: V[], valueTransformer?: TransformerTuple): string;
export function reduceTemplateString<V>(strings: TA, values: V[], valueTransformer?: TransformerObject): string;
export function reduceTemplateString<V>(strings: TA, values: V[], ...valueTransformers: [TransformerArg] | [...TransformerTuple] | [] | any[]): string
{
    const transformers: {
        strings: Transformer;
        values:  Transformer;
    } = { strings: asString, values: asString };
    
    // Collapse overloads
    if(valueTransformers.length === 0) { }
    else if(valueTransformers.length === 1)
    {
        // Shift context into first rest param only
        const arg = valueTransformers[0];

        // Overload 1: valueTransformer?: Transformer
        if(typeof arg === 'function')
        {
            // Single transformer passed? Use as value transformer
            transformers.values = arg;
        }
        // Overload 2: valueTransformer?: TransformerTuple
        else if(Array.isArray(arg))
        {
            const [strings, values] = arg;

            // TODO: Maybe dont allow holes?
            if(typeof strings === 'function')
                transformers.strings = strings;

            if(typeof values === 'function')
                transformers.values = values;
        }
        // Overload 3: valueTransformer?: TransformerObject
        else if(typeof arg === 'object')
        {
            Object.entries(arg).forEach(([key, value]: ['strings' | 'values' | string, any]) => {
                if(!(
                    (key === 'strings' || key === 'values') && typeof value === 'function'
                )) return
                
                transformers[key] = value;
            })
        }
    }
    // Overload 4: Spread TransformerTuple
    else if(valueTransformers.length === 2)
    {
        const [strings, values] = valueTransformers.slice(0, 2);

        // TODO: Maybe dont allow holes?
        if(typeof strings === 'function')
            transformers.strings = strings;

        if(typeof values === 'function')
            transformers.values = values;
    }

    let target = transformers.strings(strings[0]);
    values.forEach((value, index) => {
        target += transformers.values(value)
        target += transformers.strings(strings[index]);
    });
    return target;
}

/**
 * Applies map function to template string values, and redefines `raw` property
 * to avoid disturbing the typechecker
 * 
 * @param values 
 *   Values from `TemplateStringsArray` typed (and first) argument received
 * in a template string function.
 * 
 * @param mapper
 *   Function passed into `Array#map`
 */
function templateStringArrayMap(values: TemplateStringsArray, mapper: ToString)
{
    const newValues = values.map(mapper);
    return Object.assign(newValues, {raw: values.raw})
}