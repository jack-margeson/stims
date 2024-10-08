import { Type } from '@angular/core';

export interface IDatabaseView {
  type: Type<any>;
  displayName: string;
  description: string;
  icon: string;
}
