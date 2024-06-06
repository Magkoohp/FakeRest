import { BaseServer } from '../BaseServer.js';
import { parseQueryString } from '../parseQueryString.js';
import type {
    BaseResponse,
    FakeRestContext,
    BaseServerOptions,
    NormalizedRequest,
} from '../BaseServer.js';
import type { MockResponseObject } from 'fetch-mock';

export class FetchMockServer {
    loggingEnabled = false;
    server;

    constructor({
        loggingEnabled = false,
        server,
        ...options
    }: FetchMockServerOptions = {}) {
        this.server = server || new BaseServer(options);
        this.loggingEnabled = loggingEnabled;
    }

    getHandler() {
        const handler = async (url: string, options: RequestInit) => {
            const request = new Request(url, options);
            const normalizedRequest = await this.getNormalizedRequest(request);
            const response = await this.server.handle(normalizedRequest);
            this.log(request, response, normalizedRequest);
            return response as MockResponseObject;
        };

        return handler;
    }

    async getNormalizedRequest(request: Request): Promise<NormalizedRequest> {
        const req =
            typeof request === 'string' ? new Request(request) : request;
        const queryString = req.url
            ? decodeURIComponent(req.url.slice(req.url.indexOf('?') + 1))
            : '';
        const params = parseQueryString(queryString);
        const text = await req.text();
        let requestBody: Record<string, any> | undefined = undefined;
        try {
            requestBody = JSON.parse(text);
        } catch (e) {
            // not JSON, no big deal
        }

        return {
            url: req.url,
            headers: req.headers,
            params,
            requestBody,
            method: req.method,
        };
    }

    log(
        request: FetchMockFakeRestRequest,
        response: BaseResponse,
        normalizedRequest: NormalizedRequest,
    ) {
        if (!this.loggingEnabled) return;
        if (console.group) {
            // Better logging in Chrome
            console.groupCollapsed(
                normalizedRequest.method,
                normalizedRequest.url,
                '(FakeRest)',
            );
            console.group('request');
            console.log(normalizedRequest.method, normalizedRequest.url);
            console.log('headers', request.headers);
            console.log('body   ', request.requestJson);
            console.groupEnd();
            console.group('response', response.status);
            console.log('headers', response.headers);
            console.log('body   ', response.body);
            console.groupEnd();
            console.groupEnd();
        } else {
            console.log(
                'FakeRest request ',
                normalizedRequest.method,
                normalizedRequest.url,
                'headers',
                request.headers,
                'body',
                request.requestJson,
            );
            console.log(
                'FakeRest response',
                response.status,
                'headers',
                response.headers,
                'body',
                response.body,
            );
        }
    }

    toggleLogging() {
        this.loggingEnabled = !this.loggingEnabled;
    }
}

export const getFetchMockHandler = (options: FetchMockServerOptions) => {
    const server = new FetchMockServer(options);
    return server.getHandler();
};

/**
 * @deprecated Use FetchServer instead
 */
export const FetchServer = FetchMockServer;

export type FetchMockFakeRestRequest = Partial<Request> & {
    requestBody?: string;
    responseText?: string;
    requestJson?: Record<string, any>;
    queryString?: string;
    params?: { [key: string]: any };
};

export type FetchMockServerOptions = BaseServerOptions & {
    server?: {
        getContext: (context: NormalizedRequest) => FakeRestContext;
        handle: (context: FakeRestContext) => Promise<BaseResponse>;
    };
    loggingEnabled?: boolean;
};
