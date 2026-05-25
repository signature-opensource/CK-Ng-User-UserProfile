import { AxiosInstance, AxiosHeaders, RawAxiosRequestConfig } from 'axios';
import { ICommand, ExecutedCommand, CrisError } from './Model';
import { CrisEndpoint } from './CrisEndpoint';
import { CrisCallResult } from './CrisCallResult';
import { CTSType } from '../Core/CTSType';
import { CrisResultError } from './CrisResultError';
import { UserMessageLevel } from '../Core/UserMessageLevel';

const defaultCrisAxiosConfig: RawAxiosRequestConfig = {
    responseType: 'text',
    headers: {
        common: new AxiosHeaders({
        'Content-Type': 'application/json'
        })
    }
};
/**
* Http Cris Command endpoint. 
**/
export class HttpCrisEndpoint extends CrisEndpoint
{
    #axios: AxiosInstance;
    #typeFilterName : string;
    #crisEndpointUrl : string;

    /**
     * Gets the TypeFilterName that defines the exchangeable set of objects
     * with the backend.
     * Defaults to CTSType.typeFilterName = 'TypeScript' (the TypeFilterName for this ck-gen folder).
     */
    public get typeFilterName() { return this.#typeFilterName; }

    /**
     * Replaceable axios configuration.
     */
    public axiosConfig: RawAxiosRequestConfig; 

    /**
     * Initializes a new HttpCrisEndpoint.  
     * @param axios The axios instance.
     * @param crisEndpointUrl The Cris endpoint url to use.
     * @param typeFilterName The TypeFilterName that defines the set of objects that can be exchanged with the backend.
     */
    constructor( axios: AxiosInstance, crisEndpointUrl?: string, typeFilterName: string = CTSType.typeFilterName)
    {
        super();
        if( !crisEndpointUrl ) crisEndpointUrl = window.location.origin + '/.cris';
        this.#axios = axios;
        this.#typeFilterName = typeFilterName;
        this.#crisEndpointUrl = crisEndpointUrl + (crisEndpointUrl.indexOf('?') < 0 ? "?" : "&" ) + "TypeFilterName=" + typeFilterName;
        this.axiosConfig = defaultCrisAxiosConfig;
    }

    protected override async doSendAsync<T>(command: ICommand<T>): Promise<ExecutedCommand<T>>
    {
        try
        {
            const req = JSON.stringify(CTSType.toTypedJson(command));
            const resp = await this.#axios.post(this.#crisEndpointUrl, req, this.axiosConfig);
            const netResult = <CrisCallResult>CTSType["CrisCallResult"].nosj( JSON.parse(resp.data) );
            let r = netResult.result;
            if( r instanceof CrisResultError ) 
            {
                const errors = r.errors.filter( m => m.level === UserMessageLevel.Error ).map( m => m.message );
                r = new CrisError(command, r.isValidationError, errors, undefined, netResult.validationMessages, r.logKey);
            }
            return {command: command, result: <T|CrisError>r, validationMessages: netResult.validationMessages, correlationId: netResult.correlationId };
        }
        catch( e )
        {
            var error : Error;
            if( e instanceof Error)
            {
                error = e;
            }
            else
            {
                // Error.cause is a mess. Log it.
                console.error( e );
                error = new Error(`Unhandled error ${e}.`);
            }
            this.setIsConnected(false);
            return {command, result: new CrisError(command, false, ["Communication error"], error )};                                              }
    }
}
