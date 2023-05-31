/* --------------------------------------------------------------------------------------------
 * Copyright (c) 2023 TypeFox GmbH (http://www.typefox.io). All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import { buildWorkerDefinition } from 'monaco-editor-workers';

import 'monaco-editor/esm/vs/editor/edcore.main.js';
import { languages, Uri } from 'monaco-editor/esm/vs/editor/editor.api.js';
import { createConfiguredEditor, createModelReference } from 'vscode/monaco';
import { initServices, MonacoLanguageClient } from 'monaco-languageclient';
import { toSocket, WebSocketMessageReader, WebSocketMessageWriter } from 'vscode-ws-jsonrpc';
import normalizeUrl from 'normalize-url';
import { AfterViewInit, Component } from '@angular/core';
import { CloseAction, ErrorAction, MessageTransports } from 'vscode-languageclient/lib/common/client.js';

import 'vscode/default-extensions/theme-defaults';
import 'vscode/default-extensions/json';

buildWorkerDefinition('./assets/monaco-editor-workers/workers', window.location.href + '../..', false);

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class MonacoEditorComponent implements AfterViewInit {
    title = 'angular-client';
    initDone = false;

    createLanguageClient(transports: MessageTransports): MonacoLanguageClient {
        return new MonacoLanguageClient({
            name: 'Sample Language Client',
            clientOptions: {
                // use a language id as a document selector
                documentSelector: ['json'],
                // disable the default error handler
                errorHandler: {
                    error: () => ({ action: ErrorAction.Continue }),
                    closed: () => ({ action: CloseAction.DoNotRestart })
                }
            },
            // create a language client connection from the JSON RPC connection on demand
            connectionProvider: {
                get: () => {
                    return Promise.resolve(transports);
                }
            }
        });
    }

    createUrl(hostname: string, port: number, path: string): string {
        const protocol = location.protocol === 'https:' ? 'wss' : 'ws';
        return normalizeUrl(`${protocol}://${hostname}:${port}${path}`);
    }

    createWebSocket(url: string): WebSocket {
        const webSocket = new WebSocket(url);
        webSocket.onopen = () => {
            const socket = toSocket(webSocket);
            const reader = new WebSocketMessageReader(socket);
            const writer = new WebSocketMessageWriter(socket);
            const languageClient = this.createLanguageClient({
                reader,
                writer
            });
            languageClient.start();
            reader.onClose(() => languageClient.stop());
        };
        return webSocket;
    }

    private createDefaultJsonContent(): string {
        return `{
    "$schema": "http://json.schemastore.org/coffeelint",
    "line_endings": "unix"
}`;
    }

    async ngAfterViewInit(): Promise<void> {
        const languageId = 'json';

        if (!this.initDone) {
            await initServices({
                enableThemeService: true,
                enableModelEditorService: true,
                modelEditorServiceConfig: {
                    useDefaultFunction: true
                },
                enableLanguagesService: true,
                debugLogging: true
            });
            this.initDone = true;
        }

        // register the JSON language with Monaco
        languages.register({
            id: languageId,
            extensions: ['.json', '.jsonc'],
            aliases: ['JSON', 'json'],
            mimetypes: ['application/json']
        });

        // create the model
        const uri = Uri.parse('/tmp/model.json');
        const modelRef = await createModelReference(uri, this.createDefaultJsonContent());
        modelRef.object.setLanguageId(languageId);

        // create monaco editor
        createConfiguredEditor(document.getElementById('container')!, {
            model: modelRef.object.textEditorModel,
            glyphMargin: true,
            lightbulb: {
                enabled: true
            },
            automaticLayout: true
        });

        // create the web socket
        const url = this.createUrl('localhost', 3000, '/sampleServer');
        this.createWebSocket(url);
    }
}
