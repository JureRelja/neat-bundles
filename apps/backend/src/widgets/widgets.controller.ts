import { Controller, Get, Render, Header, Query } from "@nestjs/common";
import { WidgetsService } from "./widgets.service";
import { BundleBuilderWidgetDto } from "./dto/BundleBuilderWidgetDto";

@Controller("widgets")
export class WidgetsController {
    constructor(private readonly widgetService: WidgetsService) {}

    @Get()
    @Render("widget")
    @Header("Content-type", "application/liquid")
    async root(@Query("shop") shop: string): Promise<BundleBuilderWidgetDto> {
        return this.widgetService.getWidget(1, shop);
    }
}
