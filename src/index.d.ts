import ComponentService from './helper/component-service';
import 'koa';
declare module 'koa' {
    export interface DefaultContext {
        wxc:ComponentService;
        request:{
            xml:string;
        }
    }
}
