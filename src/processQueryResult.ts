'use strict';

import { ProcessQueryResultStatus } from './processQueryResultStatus';

export class ProcessQueryResult {
  constructor(readonly status: ProcessQueryResultStatus, readonly result?: any[]) {
  }
}