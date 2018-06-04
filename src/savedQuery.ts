'use strict';

import { OutputFormat } from './outputFormat';

export interface SavedQuery {
    title: string;
    query: string;
    output: OutputFormat;
}