/**
 * @TODO
 *
 * Preview functionality copied from ts-preview rewrite.
 *
 * `Preview` and its subclasses should be completely non-language specific in its implementation—
 * instead exposing interfaces for the various steps—instead of placing the compilation steps
 * (as well as naming of declarations). This is the case for parts already, the abstraction just
 * needs to be finished
 *
 */

export {
    // DynamicPreview,
    Preview
} from './Preview'
export { DocPreview } from './DocPreview';

// import DynamicPreview from './Preview'
import { DocPreview } from './DocPreview';
export default DocPreview