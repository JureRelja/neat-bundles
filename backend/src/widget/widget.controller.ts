import { Controller, Get, Render, Header, Query } from "@nestjs/common";
import { WidgetService } from "./widget.service";
import { BundleBuilderWidgetDto } from "./dto/BundleBuilderWidgetDto";

@Controller("widget")
export class WidgetController {
    constructor(private readonly widgetService: WidgetService) {}

    @Get()
    @Render("widget")
    @Header("Content-type", "application/liquid")
    async root(@Query("shop") shop: string): Promise<BundleBuilderWidgetDto> {
        return this.widgetService.getWidget(1, shop);
    }
}
