import powerbi from "powerbi-visuals-api";
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import "../style/visual.less";
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import { VisualFormattingSettingsModel } from "./settings";
import * as d3 from "d3";
import { BasicFilterOperators, IFilterColumnTarget, IFilterTarget } from "powerbi-models";
export interface IFilter {
    $schema: string;
    target: IFilterTarget;
}
export interface IBasicFilter extends IFilter {
    operator: BasicFilterOperators;
    values: (string | number | boolean)[];
}
export class Visual implements IVisual {
    
    private formattingSettings: VisualFormattingSettingsModel;
    private formattingSettingsService: FormattingSettingsService;
    private svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>;
    host: any;
    dataView: any;
    

    constructor(options: VisualConstructorOptions) {
        console.log('Visual constructor', options);
        this.formattingSettingsService = new FormattingSettingsService();
        this.svg = d3.select(options.element)
            .append('svg');
    }

    public update(options: VisualUpdateOptions) {
        this.formattingSettings = this.formattingSettingsService.populateFormattingSettingsModel(VisualFormattingSettingsModel, options.dataViews);
        console.log('Visual update', options);
    
        const width = options.viewport.width;
        const height = options.viewport.height;

        const margin = { top: 10, right: 10, bottom: 10, left: 10 }; // Set margins as needed
    
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;
    
        this.svg
            .attr("width", width)
            .attr("height", height)
            .selectAll("g")
            .remove();
    
        const dataView = options.dataViews[0];
    
        if (!dataView || !dataView.categorical || !dataView.categorical.categories || !dataView.categorical.categories[0]) {
            return;
        }
    
        const numbers = dataView.categorical.categories[0].values.map(value => +value); // Extract numerical values
    
        const numBoxes = numbers.length;
        const boxSize = Math.min(innerWidth / numBoxes, innerHeight); // Adjusted box size
        const spacing = 2; // Small spacing between boxes
        const totalBoxSize = boxSize - spacing; // Total size including spacing
        const xOffset = (innerWidth - (totalBoxSize * numBoxes + spacing * (numBoxes - 1)))/2; // Centering the boxes horizontally
        const yOffset = (innerHeight - boxSize) / 2; // Centering the boxes vertically
    
        const g = this.svg.append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
        const rects = g.selectAll("rect")
            .data(numbers)
            .enter()
            .append("rect")
            .attr("x", (d, i) => xOffset + i * (totalBoxSize + spacing)) // Adjust x position based on index
            .attr("y", yOffset) // Centering vertically
            .attr("width", totalBoxSize)
            .attr("height", boxSize)
            .attr("fill", d => d)
            .on("click", (d) => {
                
                console.log("clicked", d);
                
                let categories: any = options.dataViews[0].categorical.categories.values;
               
                let target: IFilterColumnTarget = {
                    table:  categories.source.queryName.substr(0, categories.source.queryName.indexOf('.')),
                    column: categories.source.displayName
                };
                let conditions: any[] = [];
                conditions.push({
                    operator: "In",
                    values: [d] // Use the clicked value here
                });
                let filter: any = new window['powerbi-models'].AdvancedFilter(target, "In", conditions);
                console.log(filter)
                // Apply filter
                this.host.applyJsonFilter(filter, "general", "filter", powerbi.FilterAction.merge);
            });
        const texts = g.selectAll("text")
            .data(numbers)
            .enter()
            .append("text")
            .attr("x", (d, i) => xOffset + i * (totalBoxSize + spacing) + totalBoxSize / 2) // Center text horizontally within each rectangle
            .attr("y", yOffset + boxSize / 2) // Center text vertically within each rectangle
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "middle")
            .style("fill", "white")
            .style("font-size", "10px") // Set smaller font size
            .text(d => d);
    }
    public getFormattingModel(): powerbi.visuals.FormattingModel {
        return this.formattingSettingsService.buildFormattingModel(this.formattingSettings);
    }
}
