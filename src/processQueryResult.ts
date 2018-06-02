'use strict';

import { ProcessQueryResultStatus } from "./ProcessQueryResultStatus";

export class ProcessQueryResult {
  constructor(readonly status: ProcessQueryResultStatus, readonly result?: any[]) {
  }
}