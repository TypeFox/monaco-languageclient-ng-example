/* --------------------------------------------------------------------------------------------
 * Copyright (c) 2023 TypeFox GmbH (http://www.typefox.io). All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import { createDefaultJsonContent, createJsonEditor, createUrl, createWebSocketAndStartClient, performInit } from 'monaco-languageclient-examples';
import { AfterViewInit, Component } from '@angular/core';
import { buildWorkerDefinition } from 'monaco-editor-workers';
buildWorkerDefinition('./assets/monaco-editor-workers/workers', window.location.href + '../..', false);

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class MonacoEditorComponent implements AfterViewInit {
    title = 'angular-client';
    initDone = false;

    async ngAfterViewInit(): Promise<void> {
        // use the same common method to create a monaco editor for json
        await performInit(!this.initDone);
        this.initDone = true;
        await createJsonEditor({
            htmlElement: document.getElementById('container')!,
            content: createDefaultJsonContent()
        });

        // create the web socket
        const url = createUrl('localhost', 3000, '/sampleServer');
        createWebSocketAndStartClient(url);
    }
}
