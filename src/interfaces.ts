import { IFilterTarget } from "powerbi-models";

export interface IFilter {
    $schema: string;
    target: IFilterTarget;
}