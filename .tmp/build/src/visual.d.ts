import powerbi from "powerbi-visuals-api";
import "../style/visual.less";
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import { BasicFilterOperators, IFilterTarget } from "powerbi-models";
export interface IFilter {
    $schema: string;
    target: IFilterTarget;
}
export interface IBasicFilter extends IFilter {
    operator: BasicFilterOperators;
    values: (string | number | boolean)[];
}
export declare class Visual implements IVisual {
    private formattingSettings;
    private formattingSettingsService;
    private svg;
    host: any;
    dataView: any;
    constructor(options: VisualConstructorOptions);
    update(options: VisualUpdateOptions): void;
    getFormattingModel(): powerbi.visuals.FormattingModel;
}
