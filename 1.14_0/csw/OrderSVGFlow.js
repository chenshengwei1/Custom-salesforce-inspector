
export class OrderSVGFlow{

    constructor(dateTree){
        this.tree = dateTree;
        this.records = [];
        this.message='';
        
        this.starting = false;
        this.lazy =true;
        this.processingQty = 0;
        
    }

    createHead(rootId){
        this.rootId = rootId;
        let treeroot = document.getElementById(rootId);
        let searchAear = `
        <style>
            .order-flow-siber {
                width: 600px;
                max-height : 80vh;
                position: fixed;
                right: 10px;
                top: 100px;
                font-size: large;
                background-color: chocolate;
                color: black;
                border: #006442 2px solid;
                border-radius: 4px;
                padding: 5px 10px;
                text-wrap: wrap;
                overflow:auto;
            }
            .order-flow-siber>div {
                padding-left: 5px;
                padding-top: 10px;
            }

            .order-flow-siber .value{
                color:#efefef;
                white-space: pre;
            }
            .line[vlocity_cmt-xomPlanView_xomPlanView] {
                fill: none;
                stroke: var(--slds-g-color-neutral-base-40, #555);
                stroke-width: 1px;
            }

            .b{
                --header-background-color:#e0e5f8;
            }
            .Completed{
                --header-background-color:#CDEFC4;
            }

            .Fatally{
                --header-background-color: var(--slds-g-color-error-base-90, #FEDED8);
                --sds-c-badge-lightest-color-border: var(--slds-g-color-error-base-60, #FE5C4C);
            }

            svg.container{
                background-color: antiquewhite;
            }

            svg.container g.swimlaneitem{
                fill: antiquewhite;
            }
            svg.container g.swimlaneitem:nth-of-type(even){
                fill: #f0e0ca;
            }


            

            .item-content.hover .item-border{
                border: 2px solid var(--slds-g-color-palette-cloud-blue-70, #1AB9FF);
            }
            .line.hover[vlocity_cmt-xomPlanView_xomPlanView] {
                stroke-width: 2px;
                stroke: var(--slds-g-color-palette-cloud-blue-70, #1AB9FF);
            }

            .item-content-inner {
                top: 0;
                left: 0;
                border-radius: 4px;
                background: var(--slds-g-color-neutral-base-100, #fff);
                overflow: hidden;
                box-shadow: 0px 0px 7px var(--slds-g-color-neutral-base-50, rgba(105, 105, 105, 0.15));
                background: var(--slds-g-color-neutral-base-100, #FFFFFF);
                --slds-c-badge-text-color: var(--slds-g-color-neutral-base-10, #181818);
            }

            .item-border[vlocity_cmt-xomPlanView_xomPlanView] {
                border: 1px solid var(--slds-g-color-neutral-base-90, #DDDBDA);
                border-radius: 4px;
                width: auto;
                overflow: hidden;
                top: 0;
                left: 0;
            }

            .item-name[vlocity_cmt-xomPlanView_xomPlanView] {
                background: var(--header-background-color, #777);
                width: 100%;
                height: 50px;
            }

            .item-header-name[vlocity_cmt-xomPlanView_xomPlanView] {
                margin-left: 13px;
                margin-top: 14px;
                width: 251px;
                height: 21px;
                line-height: 21px;
                font-weight: 700;
                font-size: 14px;
                float: left;
                color: var(--slds-g-color-neutral-base-10, #181818);
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .item-menu-icon[vlocity_cmt-xomPlanView_xomPlanView] {
                display: inline-block;
                margin-top: 9px;
                padding: 6px;
                margin-left: 12px;
            }

            .item-details[vlocity_cmt-xomPlanView_xomPlanView] {
                margin-left: 15px;
                margin-right: 15px;
                padding-top: 8px;
                border-bottom: 1px solid var(--slds-g-color-neutral-base-90, #E5E5E5);
            }

            .item-type-width[vlocity_cmt-xomPlanView_xomPlanView] {
                max-width: 100%;
            }

            .item-type[vlocity_cmt-xomPlanView_xomPlanView] {
                font-size: 14px;
                line-height: 21px;
                max-height: 42px;
                display: inline-block;
                margin-bottom: 7px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                color: var(--slds-g-color-neutral-base-10, #181818);
            }

            .item-type[vlocity_cmt-xomPlanView_xomPlanView]:after {
                content: "";
                text-align: right;
                bottom: 4px;
                right: 0;
                width: 20%;
                height: 18px;
                background: linear-gradient(to right, var(--slds-g-color-neutral-base-95, rgba(240, 240, 240, 0)), var(--slds-g-color-neutral-base-95, rgba(240, 240, 240, 1) 50%));
            }

            .date-container[vlocity_cmt-xomPlanView_xomPlanView] {
                width: 290px;
            }

            .start-date[vlocity_cmt-xomPlanView_xomPlanView] {
                padding-right: 10px;
            }

            .dates[vlocity_cmt-xomPlanView_xomPlanView] {
                width: 145px;
                display: inline-block;
                text-overflow: ellipsis;
                overflow: hidden;
                white-space: nowrap;
                margin-bottom: 8px;
            }

            .item-footer[vlocity_cmt-xomPlanView_xomPlanView] {
                height: 50px;
                padding-left: 15px;
                padding-top: 12px;
            }

            .slds-badge_lightest {
                --slds-c-badge-color-background: var(--slds-c-badge-lightest-color-background, var(--sds-c-badge-lightest-color-background, var(--slds-g-color-neutral-base-100, var(--lwc-badgeColorBackgroundLightest, rgb(255, 255, 255)))));
                --slds-c-badge-color-border: var(--slds-c-badge-lightest-color-border, var(--sds-c-badge-lightest-color-border, var(--slds-g-color-border-base-1, var(--lwc-colorBorder, rgb(201, 201, 201)))));
            }

            .slds-badge {
                display: inline-flex;
                align-items: center;
                padding: var(--lwc-spacingXxSmall, 0.25rem) var(--lwc-spacingXSmall, 0.5rem);
                color: var(--slds-c-badge-text-color, var(--sds-c-badge-text-color, var(--slds-g-color-neutral-base-10, var(--lwc-colorTextDefault, rgb(3, 45, 96)))));
                font-size: var(--slds-c-badge-font-size, var(--sds-c-badge-font-size, var(--lwc-fontSize2, 0.75rem)));
                font-weight: var(--lwc-fontWeightBold, 700);
                line-height: var(--slds-c-badge-line-height, var(--sds-c-badge-line-height, normal));
                white-space: nowrap;
                border-width: var(--slds-c-badge-sizing-border, var(--sds-c-badge-sizing-border, var(--lwc-borderWidthThin, 1px)));
                border-style: solid;
                border-color: var(--slds-c-badge-color-border, var(--sds-c-badge-color-border, transparent));
                border-radius: var(--slds-c-badge-radius-border, var(--sds-c-badge-radius-border, var(--lwc-borderRadiusPill, 15rem)));
                background-color: var(--slds-c-badge-color-background, var(--sds-c-badge-color-background, var(--slds-g-color-neutral-base-95, var(--lwc-colorBackgroundDark, rgb(243, 243, 243)))));
            }

            .shadow[vlocity_cmt-xomPlanView_xomPlanView] {
                -webkit-filter: drop-shadow(1px 1px 4px var(--slds-g-color-neutral-base-10, rgba(0, 0, 0, 0.3)));
                filter: drop-shadow(1px 1px 4px var(--slds-g-color-neutral-base-10, rgba(0, 0, 0, 0.3)));
            }


            .swimlane-text-container[vlocity_cmt-xomPlanView_xomPlanView] {
                overflow: visible;
                height: 24px;
            }

            .swimlane-text[vlocity_cmt-xomPlanView_xomPlanView] {
                display: inline-block;
            }

            .swimlane-text.fr[vlocity_cmt-xomPlanView_xomPlanView] {
                color: var(--slds-g-color-brand-base-40, #1164A3);
                font-size: 12px;
                font-weight: 400;
                cursor: pointer;
            }

            .swimlane-text.plan-def[vlocity_cmt-xomPlanView_xomPlanView] {
                color: var(--slds-g-color-brand-base-40, #1365A3);
                font-size: 13px;
                font-weight: 700;
                cursor: pointer;
                padding: 10px 8px 0px;
            }
        </style>
        <p>
            Order Id Search:
            <input class="search feedback-input" id="svgflow-ordersearchinput" type="input" value="Order" autocomplete="off" style="width:80%"></input>
            <div class="btn-container">	
                <div class="btn" id="svgflow-refreshSObjectSearch">
                    <span>Search</span>
                    <div class="dot"></div>
                </div>
            </div>
            
        </p>
        <div class="orderflow-searchresult">
            <div class="totalbar"><span>Total Records : </span><span class="totalrecordnumber">0</span></div>
            <div class="totalbar" id="svgflow-notificationmessage" style="white-space: pre;"></div>
            <div class="orderflow-view-result tabitem Result">
                <div id="svgflow-showallsobjectdatatable"></div>
            </div>
            <div class="orderflow-view-result2 tabitem Result">
                <div id="svgflow-showallsobjectdatatable2"></div>
            </div>
            <svg id="orderflow-view-result" display="none"  style="  background-color: aliceblue;" transform="translate(.5, .5)" width="3820" height="2582" class="defaultCursor">
                <g  style="" id="selectorGroup2">
                    <rect stroke="#A00" fill="#fff0f000" x="0" y="0" width="0.0" height="0" id="svg_selector_group_14"/>
                </g>
                <g id="flowGroup">
                    <title>Layer 1</title>
                </g>
                <g display="none" style="" id="selectorGroup">
                    <circle id="selectorGrip_rotate_nw" fill="#000" r="8" stroke="#000" fill-opacity="0" stroke-opacity="0" stroke-width="0" style="cursor:url(images/rotate.png) 12 12, auto;" cx="166.3944811820984" cy="240.35575526669163"></circle>
                    <circle id="selectorGrip_rotate_ne" fill="#000" r="8" stroke="#000" fill-opacity="0" stroke-opacity="0" stroke-width="0" style="cursor:url(images/rotate.png) 12 12, auto;" cx="260.2674201068294" cy="240.35575526669163"></circle>
                    <circle id="selectorGrip_rotate_se" fill="#000" r="8" stroke="#000" fill-opacity="0" stroke-opacity="0" stroke-width="0" style="cursor:url(images/rotate.png) 12 12, auto;" cx="260.2674201068294" cy="292.1296304818695"></circle>
                    <circle id="selectorGrip_rotate_sw" fill="#000" r="8" stroke="#000" fill-opacity="0" stroke-opacity="0" stroke-width="0" style="cursor:url(images/rotate.png) 12 12, auto;" cx="166.3944811820984" cy="292.1296304818695"></circle>
                    <rect id="selectorGrip_resize_nw" width="8" height="8" fill="#4F80FF" stroke="rgba(0,0,0,0)" style="cursor:nw-resize" pointer-events="all" x="166" y="240"></rect>
                    <rect id="selectorGrip_resize_n" width="8" height="8" fill="#4F80FF" stroke="rgba(0,0,0,0)" style="cursor:n-resize" pointer-events="all" x="209" y="240"></rect>
                    <rect id="selectorGrip_resize_ne" width="8" height="8" fill="#4F80FF" stroke="rgba(0,0,0,0)" style="cursor:ne-resize" pointer-events="all" x="252" y="240"></rect>
                    <rect id="selectorGrip_resize_e" width="8" height="8" fill="#4F80FF" stroke="rgba(0,0,0,0)" style="cursor:e-resize" pointer-events="all" x="252" y="262"></rect>
                    <rect id="selectorGrip_resize_se" width="8" height="8" fill="#4F80FF" stroke="rgba(0,0,0,0)" style="cursor:se-resize" pointer-events="all" x="252" y="284"></rect>
                    <rect id="selectorGrip_resize_s" width="8" height="8" fill="#4F80FF" stroke="rgba(0,0,0,0)" style="cursor:s-resize" pointer-events="all" x="209" y="284"></rect>
                    <rect id="selectorGrip_resize_sw" width="8" height="8" fill="#4F80FF" stroke="rgba(0,0,0,0)" style="cursor:sw-resize" pointer-events="all" x="166" y="284"></rect>
                    <rect id="selectorGrip_resize_w" width="8" height="8" fill="#4F80FF" stroke="rgba(0,0,0,0)" style="cursor:w-resize" pointer-events="all" x="166" y="262"></rect>
                    
                </g>
                
            </svg>
            <svg id="opesvg" transform="translate(.5, .5)" width="3820" height="2582" class="defaultCursor hide">
                <g id="floorPlanTexts"></g>
                <g id="conlineTexts"></g>
                <g id="tableTool" fill="none" stroke="#CBCBCB" stroke-width="1" pointer-events="none"></g>
                <text id="PageTimeDate" fill="#1E1E1E" stroke="none" font-family="arial"
                    style="user-select: none; pointer-events: none;"></text>
                <text id="pageNumber" fill="#1E1E1E" stroke="none" font-family="arial"
                    style="user-select: none; pointer-events: none;">
                </text>
                <path id="alongPath" fill="none" stroke="#888888"></path>
                <rect id="dirtyrect" x="0" y="0" width="0" height="0" stroke="#76EE00" stroke-width="1"
                    fill="none" display="none"></rect>
                <g id="dynLine" stroke-width="1" stroke="#1E90FF"></g>
                <image id="opeImage" transform="translate(2019.5,753.5)" display="none"
                    style="user-select: none; pointer-events: none;" xlink="http://www.w3.org/1999/xlink"
                    width="104.66666666666667" height="64.66666666666667"></image>
                <g id="anchorGroup"></g>
                <g id="containerRect" stroke="#5ac85a" stroke-width="2" fill="none"
                    style="pointer-events: none;"></g>
                <g id="selectGroup">
                    <path id="subSelectRect" fill="none" stroke-dasharray="4 4" stroke-dashoffset=".5"
                        stroke="#808080" shape-rendering="crispEdges" display="none"></path>
                    <g id="multiSelect" fill="none" stroke="rgba(255,0,255,255)" stroke-width="1"></g>
                    <path id="selectRect" fill="none" stroke-dasharray="4 4" stroke-dashoffset=".5"
                        stroke="#017FFF" shape-rendering="crispEdges" display="none"
                        d="M1610,1621L1867,1621L1867,1681L1610,1681L1610,1621Z"></path>
                    <g id="clipImg" stroke="#000000"></g>
                    <g>
                        <g id="rectPt" stroke="#017FFF" display="none">
                            <rect id="rectTL" x="1606" y="1616" width="8" height="8" fill="#ffffff" type="10"
                                display="block"></rect>
                            <rect id="rectTM" x="1734" y="1616" width="8" height="8" fill="#ffffff" type="11"
                                display="block"></rect>
                            <rect id="rectTR" x="1863" y="1616" width="8" height="8" fill="#ffffff" type="12"
                                display="block"></rect>
                            <rect id="rectRM" x="1863" y="1646" width="8" height="8" fill="#ffffff" type="13"
                                display="block"></rect>
                            <rect id="rectBR" x="1863" y="1676" width="8" height="8" fill="#ffffff" type="14"
                                display="block"></rect>
                            <rect id="rectBM" x="1734" y="1676" width="8" height="8" fill="#ffffff" type="15"
                                display="block"></rect>
                            <rect id="rectBL" x="1606" y="1676" width="8" height="8" fill="#ffffff" type="16"
                                display="block"></rect>
                            <rect id="rectLM" x="1606" y="1646" width="8" height="8" fill="#ffffff" type="17"
                                display="block"></rect>
                            <use xlink="http://www.w3.org/1999/xlink" xlink:href="#rotateCursor" id="rectRot"
                                width="16" height="16" x="1730" y="1586" type="18" display="block" fill="#FFF"
                                stroke="#017FFF"></use>
                        </g>
                        <g id="ctrlCpt" stroke="#017FFF"></g>
                        <g id="linePt" stroke="#017FFF"></g>
                    </g>
                </g>
                <path id="opeRect" fill="none" stroke-dasharray="4 4" stroke-dashoffset=".5" stroke="#017FFF"
                    shape-rendering="crispEdges" display="none"></path>
                <line id="moveLineW" stroke="#ffffff" stroke-width="1" stroke-dasharray="4 4"
                    stroke-dashoffset="4.5" display="none"></line>
                <line id="moveLine" stroke="#0093dc" stroke-width="1" stroke-dasharray="4 4"
                    stroke-dashoffset=".5" display="none"></line>
                <g id="gantt" fill="none" stroke="#0000FF" stroke-width="1" pointer-events="none"></g>
                <g id="swimrect" fill="none" stroke="#0000FF" stroke-width="1" style="pointer-events: none;"></g>
                <rect id="blockBar" stroke="none" fill="#017fff" fill-opacity="0.5" display="none"
                    style="pointer-events: none;"></rect>
                <g id="frameTips" stroke="none" opacity="0.3" style="pointer-events: none;"></g>
                <use xlink="http://www.w3.org/1999/xlink" style="pointer-events: none;" x="1810.000472440945"
                    y="1521.4488188976375"></use>
                <use xlink="http://www.w3.org/1999/xlink" xlink:href="" style="pointer-events: none;"></use>
                <g id="mmShapeNav" style="pointer-events: none;"></g>
                <g id="mmDyn" style="pointer-events: none;">
                    <svg xlink="http://www.w3.org/1999/xlink" ev="http://www.w3.org/2001/xml-events"
                        style="position: absolute; pointer-events: none;"></svg>
                    <svg xlink="http://www.w3.org/1999/xlink" ev="http://www.w3.org/2001/xml-events"
                        style="position: absolute; pointer-events: none;"></svg>

                    <svg xlink="http://www.w3.org/1999/xlink" ev="http://www.w3.org/2001/xml-events"
                        style="position: absolute; pointer-events: none;"></svg>
                </g>

                <g id="mmSelRc" style="pointer-events: none;"></g>
                <g id="mmAISelRc" style="pointer-events: none;"></g>
                <rect id="snapOrg" x="0" y="0" width="20" height="20" stroke="#ff00ff" stroke-width="1.25"
                    fill="#95EDBF" fill-opacity="0.8" display="none" style="pointer-events: none;"></rect>
                <rect id="dsPt" x="0" y="0" width="8" height="8" stroke="#ff0000" stroke-width="2" fill="none"
                    display="none" style="pointer-events: none;"></rect>
                <rect id="dockBox" x="0" y="0" width="20" height="20" stroke="#ff9b37" stroke-width="3"
                    fill="none" display="none" style="pointer-events: none;"></rect>
                <g id="slide">
                    <g id="activeSlide"></g>
                </g>
                <defs>
                    <linearGradient id="defGrad" x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox">
                        <stop offset="0" stop-color="rgba(255,255,255,1)"></stop>
                        <stop offset="1" stop-color="rgba(91,215,91,1)"></stop>
                    </linearGradient>
                    <linearGradient id="seltGrad" x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox">
                        <stop offset="0" stop-color="rgba(255,255,255,1)"></stop>
                        <stop offset="1" stop-color="rgba(255,153,0,1)"></stop>
                    </linearGradient>
                    <linearGradient id="lockGrad" x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox">
                        <stop offset="0" stop-color="rgba(191,191,191,1)"></stop>
                        <stop offset="1" stop-color="rgba(255,255,255,1)"></stop>
                    </linearGradient>
                    <linearGradient id="ctrlGrad" x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox">
                        <stop offset="0" stop-color="rgba(255,255,153,1)"></stop>
                        <stop offset="1" stop-color="rgba(255,204,0,1)"></stop>
                    </linearGradient>
                    <linearGradient id="seltSubGrad" x1="0" y1="0" x2="1" y2="1"
                        gradientUnits="objectBoundingBox">
                        <stop offset="0" stop-color="rgba(210,233,255,1)"></stop>
                        <stop offset="1" stop-color="rgba(75,166,255,1)"></stop>
                    </linearGradient>
                    <linearGradient id="redGrad" x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox">
                        <stop offset="0" stop-color="rgba(255,255,255,1)"></stop>
                        <stop offset="1" stop-color="rgba(255,60,64,1)"></stop>
                    </linearGradient>
                    <linearGradient id="grayGrad" x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox">
                        <stop offset="0" stop-color="rgba(255,255,255,1)"></stop>
                        <stop offset="1" stop-color="rgba(191,191,191,1)"></stop>
                    </linearGradient>
                    <linearGradient id="textGrad" x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox">
                        <stop offset="0" stop-color="rgba(255,255,255,1)"></stop>
                        <stop offset="1" stop-color="rgba(242,56,249,1)"></stop>
                    </linearGradient>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox">
                        <stop offset="0" stop-color="rgba(255,255,255,1)"></stop>
                        <stop offset="1" stop-color="rgba(242,56,249,1)"></stop>
                    </linearGradient>
                    <path id="coord" stroke="#017FFF" stroke-width="1" fill="none"
                        shape-rendering="geometricPrecision"
                        d="M-1,-1L1,-1L1,1L-1,1L-1,-1ZM-4,0L-1,0M1,0L5,0M0,-4L0,-1M0,4L0,1"></path>
                    <g id="anchor" fill="none">
                        <line x1="-3" y1="-3" x2="3" y2="3" stroke="#FFF" stroke-width="3"></line>
                        <line x1="3" y1="-3" x2="-3" y2="3" stroke="#FFF" stroke-width="3"></line>
                        <line x1="-3" y1="-3" x2="3" y2="3" stroke="#017FFF" stroke-width="1"
                            shape-rendering="crispEdges"></line>
                        <line x1="3" y1="-3" x2="-3" y2="3" stroke="#017FFF" stroke-width="1"
                            shape-rendering="crispEdges"></line>
                    </g>
                    <g id="dockAnchor" fill="none">
                        <circle xlink="http://www.w3.org/1999/xlink" xlink:href="#anchor" cx="0" cy="0" r="9"
                            fill="#F63438" fill-opacity="0.3"></circle>
                        <circle xlink="http://www.w3.org/1999/xlink" xlink:href="#anchor" cx="0" cy="0" r="4.5"
                            fill="#F73438"></circle>
                        <circle xlink="http://www.w3.org/1999/xlink" xlink:href="#anchor" cx="0" cy="0" r="5"
                            stroke="white" stroke-opacity="0.5"></circle>
                    </g>
                    <circle id="outlinePt" r="4.5" cx="0" cy="0" fill="#FF7F00" stroke="#FCFCFC"
                        stroke-width="1.5"></circle>
                    <symbol id="pinLock">
                        <image xlink="http://www.w3.org/1999/xlink" xlink:href="./source/UImg/pinned.png"
                            width="16" height="16"></image>
                    </symbol>
                    <symbol id="pinUnlock">
                        <image xlink="http://www.w3.org/1999/xlink" xlink:href="./source/UImg/pinned2.png"
                            width="16" height="16"></image>
                    </symbol>
                    <symbol id="note" width="18" height="18">
                        <rect xmlns="http://www.w3.org/2000/svg" x="0" y="0" width="18" height="18"
                            style="fill:transparent"></rect>
                        <path xmlns="http://www.w3.org/2000/svg"
                            d="M15.2,4.47,13,2.28a1,1,0,0,0-1.41,0L10.14,3.74l-.72.72L2.94,10.95,1.45,15.41a.5.5,0,0,0,.47.66l.16,0,4.46-1.49L13,8.06h0L15.2,5.89A1,1,0,0,0,15.2,4.47ZM6,13.68,2.72,14.77l1.09-3.28,6.32-6.32,2.19,2.19Zm7-7L10.85,4.45,12.31,3h0L14.5,5.18Z"
                            style="fill:#484b64"></path>
                        <rect xmlns="http://www.w3.org/2000/svg" x="7" y="16" width="2" height="1"
                            style="fill:#484b64"></rect>
                        <rect xmlns="http://www.w3.org/2000/svg" x="10" y="16" width="2" height="1"
                            style="fill:#484b64"></rect>
                        <rect xmlns="http://www.w3.org/2000/svg" x="13" y="16" width="2" height="1"
                            style="fill:#484b64"></rect>
                    </symbol>
                    <symbol id="link" width="18" height="18">
                        <rect xmlns="http://www.w3.org/2000/svg" x="0" y="0" width="18" height="18"
                            style="fill:transparent"></rect>
                        <path xmlns="http://www.w3.org/2000/svg"
                            d="M8.14,10.65a.49.49,0,0,1-.3-.1,3.37,3.37,0,0,1-.39-.34,3.44,3.44,0,0,1,0-4.86l2.88-2.87a3.44,3.44,0,1,1,4.86,4.86L14,8.55a.5.5,0,0,1-.71-.71l1.22-1.22A2.44,2.44,0,1,0,11,3.18L8.16,6.06a2.44,2.44,0,0,0,0,3.45,2.48,2.48,0,0,0,.28.24.5.5,0,0,1-.3.9Z"
                            style="fill:#484b64"></path>
                        <path xmlns="http://www.w3.org/2000/svg"
                            d="M5.41,15.69A3.44,3.44,0,0,1,3,9.82L4.33,8.47A.5.5,0,0,1,5,9.17L3.68,10.53A2.44,2.44,0,1,0,7.13,14L10,11.1a2.44,2.44,0,0,0-.47-3.81.5.5,0,1,1,.52-.86,3.44,3.44,0,0,1,.66,5.38L7.84,14.68A3.43,3.43,0,0,1,5.41,15.69Z"
                            style="fill:#484b64"></path>
                    </symbol>
                    <symbol id="comment" width="18" height="18">
                        <rect xmlns="http://www.w3.org/2000/svg" x="0" y="0" width="18" height="18"
                            style="fill:transparent"></rect>
                        <path xmlns="http://www.w3.org/2000/svg" d="M11.5,7h-5a.5.5,0,0,1,0-1h5a.5.5,0,0,1,0,1Z"
                            style="fill:#484b64"></path>
                        <path xmlns="http://www.w3.org/2000/svg"
                            d="M10.5,10h-3a.5.5,0,0,1,0-1h3a.5.5,0,0,1,0,1Z" style="fill:#484b64"></path>
                        <path xmlns="http://www.w3.org/2000/svg"
                            d="M9,3c3.3,0,6,2.29,6,5.1s-2.68,5.1-6,5.1A6.81,6.81,0,0,1,7.21,13l-.45-.12-.38.27L5,14.08V12l-.34-.3A4.72,4.72,0,0,1,3,8.11C3,5.3,5.68,3,9,3M9,2C5.12,2,2,4.74,2,8.11A5.73,5.73,0,0,0,4,12.4V16L7,13.94a7.84,7.84,0,0,0,2,.28c3.85,0,7-2.73,7-6.1S12.83,2,9,2Z"
                            style="fill:#484b64"></path>
                    </symbol>
                    <symbol xmlns="http://www.w3.org/2000/svg" id="httpshere2serveuatdvlocitycmtsandboxvfforcecomsldsiconsutilityspritesvgsymbolssvg_threedots" viewBox="0 0 52 52">
                        <path d="M8 20c3.3 0 6 2.7 6 6s-2.7 6-6 6-6-2.7-6-6 2.7-6 6-6zm18 0c3.3 0 6 2.7 6 6s-2.7 6-6 6-6-2.7-6-6 2.7-6 6-6zm18 0c3.3 0 6 2.7 6 6s-2.7 6-6 6-6-2.7-6-6 2.7-6 6-6z"></path>
                    </symbol>
                    <g id="lineBegin" shape-rendering="geometricPrecision">
                        <circle r="5" cx="0" cy="0" fill="#fff" stroke-width="1"></circle>
                        <rect x="-1.75" y="-1.75" width="3.5" height="3.5" stroke="none"></rect>
                    </g>
                    <g id="lineEnd" shape-rendering="geometricPrecision">
                        <circle r="5" cx="0" cy="0" fill="#fff" stroke-width="1"></circle>
                        <circle r="2.5" cx="0" cy="0" stroke="none"></circle>
                    </g>
                    <g id="wallMidVer" shape-rendering="geometricPrecision" stroke="none" stroke-width="1"
                        fill="none" fill-rule="evenodd" transform="translate(-9, -9)">
                        <g id="编辑页面" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                            <g id="wallV">
                                <circle id="椭圆形" stroke="#017FFF" fill="#FFFFFF" cx="9" cy="9" r="8.5"></circle>
                                <path
                                    d="M10,7 L9.999,11 L13,11 L9,15 L5,11 L7.999,11 L8,7 L5,7 L9,3 L13,7 L10,7 Z"
                                    id="形状结合" fill="#017FFF"></path>
                            </g>
                        </g>
                    </g>
                    <g id="wallMidHor" shape-rendering="geometricPrecision" stroke="none" stroke-width="1"
                        fill="none" fill-rule="evenodd" transform="translate(-9, -9)">
                        <g id="编辑页面" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                            <g id="wallH" transform="translate(9, 9) rotate(-270) translate(-9, -9) ">
                                <circle id="椭圆形" stroke="#017FFF" fill="#FFFFFF" cx="9" cy="9" r="8.5"></circle>
                                <path
                                    d="M10,7 L9.999,11 L13,11 L9,15 L5,11 L7.999,11 L8,7 L5,7 L9,3 L13,7 L10,7 Z"
                                    id="形状结合" fill="#017FFF"></path>
                            </g>
                        </g>
                    </g>
                    <g id="BoundaryPointHor" fill="#ebf5ff" stroke="#ebf5ff" stroke-width="1.5">
                        <circle cx="1.5" cy="1.5" r="1.5"></circle>
                        <circle cx="1.5" cy="6.5" r="1.5"></circle>
                        <circle cx="1.5" cy="11.5" r="1.5"></circle>
                        <circle cx="1.5" cy="16.5" r="1.5"></circle>
                    </g>
                    <g id="BoundaryPointVer" fill="#ebf5ff" stroke="#ebf5ff" stroke-width="1.5">
                        <circle cx="1.5" cy="1.5" r="1.5"></circle>
                        <circle cx="6.5" cy="1.5" r="1.5"></circle>
                        <circle cx="11.5" cy="1.5" r="1.5"></circle>
                        <circle cx="16.5" cy="1.5" r="1.5"></circle>
                    </g>
                    <symbol id="imgCon" x="-3.5" y="-3.5">
                        <rect x="0.5" y="0.5" width="7" height="7" fill="#55abff" stroke="#606060"></rect>
                    </symbol>
                </defs>
                <defaultFloats>
                    <image id="attachment" width="18" height="18" xlink="http://www.w3.org/1999/xlink"
                        xlink:href="./source/image32/floatButton/attachment.svg"></image>
                    <image id="container" width="25" height="25" xlink="http://www.w3.org/1999/xlink"
                        xlink:href="./source/image32/floatButton/container.svg"></image>
                    <g id="EditCard">
                        <rect width="16" height="16" xlink="http://www.w3.org/1999/xlink" fill="inherit"></rect>
                        <image width="16" height="16" xlink="http://www.w3.org/1999/xlink"
                            xlink:href="./source/image32/floatButton/editcard.svg"></image>
                    </g>
                    <g id="topTriangle">
                        <circle cx="8" cy="8" r="7" stroke="#343434" fill="white"></circle>
                        <path stroke="#343434" stroke-width="2" stroke-linejoin="round" fill="#343434"
                            d="M8,5L5,9.6L11,9.6Z"></path>
                    </g>
                    <g id="bottomTriangle">
                        <use transform="rotate(180)" transform-origin="8 8" xlink="http://www.w3.org/1999/xlink"
                            xlink:href="#topTriangle"></use>
                    </g>
                    <g id="leftTriangle">
                        <use transform="rotate(-90)" transform-origin="8 8" xlink="http://www.w3.org/1999/xlink"
                            xlink:href="#topTriangle"></use>
                    </g>
                    <g id="rightTriangle">
                        <use transform="rotate(90)" transform-origin="8 8" xlink="http://www.w3.org/1999/xlink"
                            xlink:href="#topTriangle"></use>
                    </g>
                    <g id="topFlowTriangle">
                        <circle cx="8" cy="8" r="8" stroke="none" fill="inherit"></circle>
                        <rect x="4" y="7.25" width="8" height="1.5" rx="0.75" fill="white"></rect>
                        <rect x="7.25" y="12" width="8" height="1.5" rx="0.75" transform="rotate(-90 7.25 12)"
                            fill="white"></rect>
                    </g>
                    <g id="bottomFlowTriangle">
                        <circle cx="8" cy="8" r="8" stroke="none" fill="inherit"></circle>
                        <rect x="4" y="7.25" width="8" height="1.5" rx="0.75" fill="white"></rect>
                        <rect x="7.25" y="12" width="8" height="1.5" rx="0.75" transform="rotate(-90 7.25 12)"
                            fill="white"></rect>
                    </g>
                    <g id="leftFlowTriangle">
                        <circle cx="8" cy="8" r="8" stroke="none" fill="inherit"></circle>
                        <rect x="4" y="7.25" width="8" height="1.5" rx="0.75" fill="white"></rect>
                        <rect x="7.25" y="12" width="8" height="1.5" rx="0.75" transform="rotate(-90 7.25 12)"
                            fill="white"></rect>
                    </g>
                    <g id="rightFlowTriangle">
                        <circle cx="8" cy="8" r="8" stroke="none" fill="inherit"></circle>
                        <rect x="4" y="7.25" width="8" height="1.5" rx="0.75" fill="white"></rect>
                        <rect x="7.25" y="12" width="8" height="1.5" rx="0.75" transform="rotate(-90 7.25 12)"
                            fill="white"></rect>
                    </g>
                    <symbol id="add">
                        <circle cx="7" cy="7" r="6.5" stroke="#343434" fill="white"></circle>
                        <rect stroke="none" fill="#343434" x="3" y="6" width="8" height="2" rx="1"></rect>
                        <rect stroke="none" fill="#343434" x="6" y="3" width="2" height="8" rx="1"></rect>
                    </symbol>
                    <g id="toggleOff">
                        <path stroke="#3482f7" stroke-width="1" fill="#ffffff"
                            d="M16,8C16,12.4,12.4,16,8,16C3.5,16,0,12.4,0,8C0,3.5,3.5,0,8,0C12.4,0,16,3.5,16,8Z"></path>
                        <path stroke="#227cf4" stroke-width="1" fill="#227cf4" d="M3,6L13,6L13,10L3,10L3,6Z"></path>
                    </g>
                    <g id="stopDrill" width="14" height="14">
                        <g transform="translate(1, 1)" stroke="#017EFF" stroke-width="1" fill="none">
                            <rect fill="#FFFFFF" x="0" y="0" width="14" height="14" rx="2"></rect>
                            <path transform="translate(7, 6) rotate(-90) translate(-7, -6) translate(1.5, 0.5)"
                                fill="#017EFF" fill-opacity="0.3"
                                d="M1,7.5 L4.5,7.5 L4.5,9.863 L9.26,5.5 L4.5,1.136 L4.5,3.5 L1,3.5 C0.723,3.5 0.5,3.723 0.5,4 L0.5,7 C0.5,7.276 0.723,7.5 1,7.5 Z"></path>
                        </g>
                    </g>
                    <g id="action">
                        <rect stroke="none" fill="transparent" x="0" y="0" width="16" height="19"
                            style="pointer-events: auto;"></rect>
                        <path stroke="#3482f7" stroke-width="1" fill="#ffffff"
                            d="M16,8C16,12.4,12.4,16,8,16C3.5,16,0,12.4,0,8C0,3.5,3.5,0,8,0C12.4,0,16,3.5,16,8Z"></path>
                        <path stroke="#3482f7" stroke-width="1" fill="#3482f7" d="M3,4L13,4L13,7L3,7L3,4Z"></path>
                        <path stroke="#227cf4" stroke-width="1" fill="#227cf4" d="M3,9L13,9L13,12L3,12L3,9Z"></path>
                    </g>
                    <symbol id="plus">
                        <circle r="6.5" cx="7.5" cy="7.5" stroke-width="1" fill="#FFFFFF" stroke="inherit"></circle>
                        <path d="M8 4V10 M 4 8 H10" stroke="inherit"></path>
                    </symbol>
                    <symbol id="minus">
                        <circle r="6.5" cx="7.5" cy="7.5" stroke-width="1" fill="#FFFFFF" stroke="inherit"></circle>
                        <path d="M 4 8 H10" stroke="inherit"></path>
                    </symbol>
                </defaultFloats>
                <path id="flowConline" fill="none" stroke="#626262" stroke-width="1" stroke-dasharray="4 4"
                    stroke-dashoffset=".5" d="" display="none"></path>
                <g id="floatButtons"></g>
                <path id="rightAngleTool" fill="none" stroke="#626262" stroke-width="1" stroke-dasharray="4 4"
                    stroke-dashoffset=".5" shape-rendering="crispEdges" display="none"
                    d="M1692.3,1500.6L1878.3,1500.6L1878.3,1772.6">
                </path>
                <path id="rightAngleTool" fill="none" stroke="#626262" stroke-width="1" stroke-dasharray="4 4"
                    stroke-dashoffset=".5" shape-rendering="crispEdges" display="none"
                    d="M2140.3,1675.6L2554.3,1675.6L2554.3,1631.6L2582.3,1631.6"></path>
                <path id="straightLineTool" fill="none" stroke="#626262" stroke-width="1" stroke-dasharray="4 4"
                    stroke-dashoffset=".5" shape-rendering="crispEdges" display="none"></path>
                <path id="straightLineTool" fill="none" stroke="#626262" stroke-width="1" stroke-dasharray="4 4"
                    stroke-dashoffset=".5" shape-rendering="crispEdges" display="none"></path>
                <path id="straightLineTool" fill="none" stroke="#626262" stroke-width="1" stroke-dasharray="4 4"
                    stroke-dashoffset=".5" shape-rendering="crispEdges" display="none"></path>
                <path id="rightAngleTool" fill="none" stroke="#626262" stroke-width="1" stroke-dasharray="4 4"
                    stroke-dashoffset=".5" shape-rendering="crispEdges" display="none"
                    d="M2146.3,1782.6L2482.3,1782.6L2482.3,1650.6L2510.3,1650.6"></path>
                <path id="straightLineTool" fill="none" stroke="#626262" stroke-width="1" stroke-dasharray="4 4"
                    stroke-dashoffset=".5" shape-rendering="crispEdges" display="none"></path>
                <path id="rightAngleTool" fill="none" stroke="#626262" stroke-width="1" stroke-dasharray="4 4"
                    stroke-dashoffset=".5" shape-rendering="crispEdges" display="none"
                    d="M1870,1842.6L1927,1842.6"></path>
                <path id="rightAngleTool" fill="none" stroke="#626262" stroke-width="1" stroke-dasharray="4 4"
                    stroke-dashoffset=".5" shape-rendering="crispEdges" display="none"
                    d="M1893,1491.6L1982,1491.6L1982,1366.6L2010,1366.6"></path>
                <path id="rightAngleTool" fill="none" stroke="#626262" stroke-width="1" stroke-dasharray="4 4"
                    stroke-dashoffset=".5" shape-rendering="crispEdges" display="none"
                    d="M2267,1850.6L2423,1850.6L2423,1959.6L3212,1959.6"></path>
            </svg>
            <div class="orderflow-view-result3 tabitem Result">
                <div id="svgflow-showallsobjectdatatable3"></div>
            </div>
        </div>`
            var div = document.createElement("div");
            div.innerHTML=searchAear;
            treeroot.appendChild(div);
            this.initObjectAllDataHead();
    }

    totalReocrds(qty){
        $('.orderflow-searchresult .totalrecordnumber').text(qty);

    }

    showMessage(message, type){
        this.print('\n'+message);
    }


    initObjectAllDataHead(){

        this.addEventLiser();
        this.getOrchestrationDependency();

        if(this.tree.recordId){
            $('#svgflow-ordersearchinput').val(this.tree.recordId);
        }

    }

    addEventLiser(){
        $('#svgflow-refreshSObjectSearch').on('click',()=>{
            let id = $('#svgflow-ordersearchinput').val();
            if (!id){
                return;
            }
            this.loadOrderOrchestractions(id);
        })
        
        $('.orderflow-searchresult svg').on('click', (event)=>{
            
            if ($(event.target).is('svg')){
                this.unhandleSelection();
                return;
            }
            console.log('click', event.target);
            this.handleSelection(event.target);
        })

        $('.orderflow-searchresult').on('click',()=>{
            $('.order-flow-siber').remove();
        })

        $('.orderflow-searchresult').on('click','.order-flow-siber', (event)=>{
            event.stopPropagation();
        })
        
    }
    
    handleSelection(target){

        let x=0;
        let y=0;
        let h=1;
        let w=1;

        if ($(target).is('rect')){
            x = target.x.baseVal.value;
            y = +target.y.baseVal.value;
            h = +target.height.baseVal.value;
            w = +target.width.baseVal.value;
        }else if ($(target).is('text')){
            x = +target.x.baseVal[0].value;
            y = +target.y.baseVal[0].value - 20;
            const rect = target.getBoundingClientRect();

            h = +rect.height || 0;
            w = +rect.width || 0;
        }
        
        $('#selectorGroup').css({display:'inline'});

        $('#selectorGrip_rotate_nw').attr('cx',x-4);//西北
        $('#selectorGrip_rotate_nw').attr('cy',y-4);

        $('#selectorGrip_rotate_ne').attr('cx',x+w-4);//东北
        $('#selectorGrip_rotate_ne').attr('cy',y-4);

        $('#selectorGrip_rotate_se').attr('cx',x+w-4);//东南
        $('#selectorGrip_rotate_se').attr('cy',y+h-4);

        $('#selectorGrip_rotate_sw').attr('cx',x-4);//西南
        $('#selectorGrip_rotate_sw').attr('cy',y+h-4);


        $('#selectorGrip_resize_nw').attr('x',x-4);//西北
        $('#selectorGrip_resize_nw').attr('y',y-4);

        $('#selectorGrip_resize_n').attr('x', x+w/2);//北
        $('#selectorGrip_resize_n').attr('y',y-4);

        $('#selectorGrip_resize_ne').attr('x',x+w-4);//东北
        $('#selectorGrip_resize_ne').attr('y',y-4);

        $('#selectorGrip_resize_e').attr('x', x+w-4);//东
        $('#selectorGrip_resize_e').attr('y',y+h/2);

        $('#selectorGrip_resize_se').attr('x',x+w-4);//东南
        $('#selectorGrip_resize_se').attr('y',y+h-4);

        $('#selectorGrip_resize_s').attr('x', x+w/2);//南
        $('#selectorGrip_resize_s').attr('y', y+h-4);

        $('#selectorGrip_resize_sw').attr('x',x-4);//西南
        $('#selectorGrip_resize_sw').attr('y',y+h-4);

        $('#selectorGrip_resize_w').attr('x', x-4);//西
        $('#selectorGrip_resize_w').attr('y', y+h/2);
    }

    unhandleSelection(){
        $('#selectorGroup').css({display:'none'})
    }

    async loadOrderOrchestractions(orderId){

        let sobjectname = await  this.tree.getSObjectNameById(orderId);
        let soql = `select Id,Name,vlocity_cmt__OrchestrationPlanId__c,
        vlocity_cmt__Account__c,
        vlocity_cmt__EndOfSequence__c,
        vlocity_cmt__ExecutionLog__c,
        vlocity_cmt__ItemImplementationId__c,
        vlocity_cmt__ItemLength__c,
        vlocity_cmt__ManualQueueId__c,
        vlocity_cmt__NumberOfRetries__c,
        vlocity_cmt__OrchestrationItemDefinitionId__c,
        vlocity_cmt__OrchestrationItemType__c,
        vlocity_cmt__OrchestrationPlanDefinitionId__c,
        vlocity_cmt__OrchestrationPlanDefinitionId__r.Name,
        vlocity_cmt__OrchestrationQueueId__c,
        vlocity_cmt__OrderItemId__c,
        vlocity_cmt__OrderItemId__r.Order.Name,
        vlocity_cmt__OrderItemId__r.OrderId,
        vlocity_cmt__Priority__c,
        vlocity_cmt__Response__c,
        vlocity_cmt__StartDate__c,
        vlocity_cmt__State__c,
        vlocity_cmt__compensatedOrchestrationItemId__c,
        vlocity_cmt__ProcessAfter__c from vlocity_cmt__OrchestrationItem__c`;

        if (sobjectname == 'Order'){
            soql = soql+` where vlocity_cmt__OrderItemId__r.orderid='${orderId}'`;
        }else if (sobjectname == 'OrderItem'){
            soql = soql+` where vlocity_cmt__OrderItemId__c='${orderId}'`;
        }else if(sobjectname == 'vlocity_cmt__OrchestrationPlan__c'){
            soql = soql+` where vlocity_cmt__OrchestrationPlanId__c='${orderId}'`;
        }
        else{
            this.showMessage('No correct order/orderitem id', 'error');
            $('.orderflow-view-result3').show();
            return;
        }
        $('.orderflow-view-result3').hide();

        let result = await this.tree.getRecordsBySoql(soql);
        this.message = result.title;
        this.lastData = result.data || {records:[], totalSize:0};
        if (this.message){
            this.showMessage(this.message, 'error');
        }else{
            this.showMessage('');
        }
        this.fetchOrchestrationPlanDefinition(this.lastData.allRecords||[]);
        this.fetchOrderName(this.lastData.allRecords||[]);
        if (this.lastData.allRecords.length){
            await this.fetchDependencyInstanceItem(this.lastData.allRecords[0].vlocity_cmt__OrderItemId__r.OrderId);
        }
        await this.processOrchestractData(this.lastData.allRecords||[]);
    }

    async fetchDependencyInstanceItem(orderId){
        let soql = `select Id,Name,
        vlocity_cmt__OrchestrationItemId__c,
        vlocity_cmt__DependsOnItemId__c,
        vlocity_cmt__OrchestrationDependencyDefinitionId__c 
        from vlocity_cmt__OrchestrationDependency__c
            where vlocity_cmt__OrchestrationItemId__r.vlocity_cmt__OrderItemId__r.OrderId='${orderId}'`;
        let result = await this.tree.getRecordsBySoql(soql);
        this.message = result.title;
        this.orderitemDependecyInstances = result?.results ||[];
    }

    fetchOrchestrationPlanDefinition(orchestrationItems){
        this.orchestrationPlanDefinitions = {};
        for (let orchestrationItem of orchestrationItems){
            this.orchestrationPlanDefinitions[orchestrationItem.vlocity_cmt__OrchestrationPlanDefinitionId__c] = orchestrationItem.vlocity_cmt__OrchestrationPlanDefinitionId__r.Name;
        };
    }
    fetchOrderName(orchestrationItems){
        this.orderName = '';
        if (orchestrationItems.length){
            this.orderName =orchestrationItems[0].vlocity_cmt__OrderItemId__r.Order.Name;
        }
    }

    async processOrchestractData(allRecords){
        console.log('allRecords='+allRecords);
        // let keys = Object.keys(this.svgMap);
        // for(let key of keys){
        //     let rect = this.svgMap[key];
        //     if (rect){
        //         $('#'+rect.id).attr('fill','#fff');
        //     }
        // }

        ;

        let omplan2 = new OMPlan2(this.allOrchestrationDependencyDefinitions, 'svgflow-showallsobjectdatatable2');
        omplan2.master = this;
        omplan2.orderitemDependecyInstances = this.orderitemDependecyInstances;
        omplan2.create(allRecords);

        

        let allRects = [];
        let rectMps = {};
        let gMap = {};
        this.svgMap = {};

        let grouppingNumbers = {};
        for (let record of allRecords){
            let level = this.id2groupMap[record.vlocity_cmt__OrchestrationItemDefinitionId__c]|| 0;
            grouppingNumbers[level] = true;
        }

        let dependecyItems = [];
        for (let itemDefined of this.allOrchestrationDependencyDefinitions){
            let level = this.id2groupMap[itemDefined.Id];
            if (grouppingNumbers[level]){
                dependecyItems.push(itemDefined);
            }
        }

        this.processData(dependecyItems);
        

        allRecords.forEach(element => {
            this.print(element.Name+":"+element.vlocity_cmt__State__c+'\n');
            let rect = this.getSVGRectByOrchId(element.vlocity_cmt__OrchestrationItemDefinitionId__c);
            if (rect){
                rectMps[rect.id] = rectMps;
                this.print(rect.id+' => '+this.getDefinitionName(element.vlocity_cmt__OrchestrationItemDefinitionId__c))
                if(element.vlocity_cmt__State__c=='Completed'){
                    $('#'+rect.id).attr('fill','#7DD8B5');
                }else if(element.vlocity_cmt__State__c=='Skipped' || element.vlocity_cmt__State__c=='Cancelled'){
                    $('#'+rect.id).attr('fill','#1313193b');
                }else if(element.vlocity_cmt__State__c=='Failed Discarded'||element.vlocity_cmt__State__c=='Fatally Failed'||element.vlocity_cmt__State__c=='Failed'){
                    $('#'+rect.id).attr('fill','#1313193b');
                }else{
                    $('#'+rect.id).attr('fill','#A86');
                }
                gMap[rect.g] = true;
                allRects.push(rect);
            }
        });

        for (let key in this.svgMap){
            let svgEle = this.svgMap[key];
            if(svgEle.g && gMap[svgEle.g] && allRects.indexOf(svgEle) == -1){
                allRects.push(svgEle);
            }
        }


        let left = 10000;
        let right = 0;
        let top = 10000;
        let bottom = 0;
        for(let child of allRects){
            left = Math.min(left, child.x);
            right = Math.max(right, child.x + child.w);
            top = Math.min(top, child.y);
            bottom = Math.max(bottom, child.y+child.h);
        }

        // $('#svg_selector_group_14').attr('x',left);
        // $('#svg_selector_group_14').attr('y',top);
        // $('#svg_selector_group_14').attr('width',right-left);
        // $('#svg_selector_group_14').attr('height',bottom-top);
        // $('#svg_selector_group_14').show();

       // $('#orderflow-view-result').attr('viewBox',`${left - 50} ${top- 50} ${right-left+100} ${bottom-top+100}`)
        //$('#orderflow-view-result').css({width:right-left+100+'px', height:bottom-top+100+'px'});
    }

    getSVGRectByOrchId(ref){
        if (this.svgMap[ref]){
            return this.svgMap[ref];
        }
        return null;
    }

    getDefinitionPathName(definitionId){
        let parentDefIds = this.getDependencies(definitionId);
        for(let pId of parentDefIds){
            let pName = this.getDefinitionPathName(pId);
        }
        let defName = this.getDefinitionName(definitionId);

        let chidrenDefIds = this.getDependencied(definitionId);
        for(let cId of chidrenDefIds){
            let cName = this.getDefinitionPathName(cId);
        }
        return defName;
    }

    getDependencies(definitionId){
        let items = [];
        for (let itemDefined of this.lastData.allRecords||[]){
            if (itemDefined.vlocity_cmt__OrchestrationItemDefinitionId__c == definitionId){
                items.push(itemDefined.vlocity_cmt__DependencyItemDefinitionId__c);
            }
        }
        return items;
    }

    getDependencied(definitionId){
        let items = [];
        for (let itemDefined of this.lastData.allRecords||[]){
            if (itemDefined.vlocity_cmt__DependencyItemDefinitionId__c == definitionId){
                items.push(itemDefined.vlocity_cmt__OrchestrationItemDefinitionId__c);
            }
        }
        return items;
    }

    getDefinitionName(definitionId){
        return this.allItemDefinitions[definitionId] || definitionId;
    }

    async getOrchestrationDependency(){
        let soql = `select Id, Name, 
        vlocity_cmt__DependencyItemDefinitionId__c, 
        vlocity_cmt__DependencyPlanDefinitionId__c, 
        vlocity_cmt__OrchestrationItemDefinitionId__c, 
        vlocity_cmt__OrchestrationPlanDefinition__c, 
        vlocity_cmt__DependencyItemDefinitionId__r.Name, 
        vlocity_cmt__DependencyItemDefinitionId__r.vlocity_cmt__OrchestrationPlanDefinitionId__c,
        vlocity_cmt__DependencyItemDefinitionId__r.vlocity_cmt__OrchestrationPlanDefinitionId__r.Name,
        vlocity_cmt__OrchestrationItemDefinitionId__r.Name,
        vlocity_cmt__OrchestrationItemDefinitionId__r.vlocity_cmt__OrchestrationPlanDefinitionId__c,
        vlocity_cmt__OrchestrationItemDefinitionId__r.vlocity_cmt__OrchestrationPlanDefinitionId__r.Name
        from vlocity_cmt__OrchestrationDependencyDefinition__c  order by CreatedDate desc limit 1000`;
        let result = await this.tree.getRecordsBySoql(soql);
        this.message = result.title;
        this.lastData = result.data || {records:[], totalSize:0};
        if (this.message){
            this.showMessage(this.message, 'error');
        }else{
            this.showMessage('');
        }

        this.allOrchestrationDependencyDefinitions = this.lastData.allRecords||[];
        this.createOMPlanDefine();
        this.id2groupMap = this.initGroupping(this.allOrchestrationDependencyDefinitions);
        this.initProcessAllData(this.allOrchestrationDependencyDefinitions);
        this.processData(this.allOrchestrationDependencyDefinitions, this.id2groupMap);
    }

    async query(recordId){
        let sobjectname = await this.tree.getSObjectNameById(recordId);
        if(sobjectname == 'vlocity_cmt__OrchestrationItem__c'){
            let soql = `select Id,Name,
            vlocity_cmt__OrchestrationPlanId__c,
            vlocity_cmt__OrchestrationItemDefinitionId__c,
            vlocity_cmt__OrchestrationItemDefinitionId__r.Name,
            vlocity_cmt__OrchestrationItemDefinitionId__r.RecordType.Name,
            vlocity_cmt__OrchestrationItemDefinitionId__r.vlocity_cmt__itemImplementationId__r.Name,
            vlocity_cmt__OrchestrationItemDefinitionId__r.vlocity_cmt__itemImplementationId__r.vlocity_cmt__Implementation__c,
            vlocity_cmt__OrchestrationItemDefinitionId__r.vlocity_cmt__ConditionData__c,
            vlocity_cmt__OrchestrationItemDefinitionId__r.vlocity_cmt__SystemInterfaceId__r.Id,
            vlocity_cmt__OrchestrationItemDefinitionId__r.vlocity_cmt__SystemInterfaceId__r.vlocity_cmt__Implementation__c,
            vlocity_cmt__OrchestrationItemDefinitionId__r.vlocity_cmt__SystemInterfaceId__r.vlocity_cmt__Key__c,
            vlocity_cmt__OrchestrationItemDefinitionId__r.vlocity_cmt__EventConditionData__c,
            vlocity_cmt__OrchestrationItemDefinitionId__r.vlocity_cmt__itemImplementationId__r.Id,
            vlocity_cmt__OrchestrationPlanDefinitionId__c,
            vlocity_cmt__OrderItemId__c,
            vlocity_cmt__Request__c,
            vlocity_cmt__Response__c,
            vlocity_cmt__State__c 
            from vlocity_cmt__OrchestrationItem__c`;
            soql = soql+` where Id='${recordId}'`;
            let result = await this.tree.getRecordsBySoql(soql);
            let records = result.data.records;
            console.dir(records);
            let planitem = records[0];

            let eventObjectToExpress = (condObj)=>{
                if (condObj.type == "SIMPLE"){
                    return condObj['left-side-type']+'.'+condObj['left-side'] + ''+condObj['op'] +condObj['right-side'];
                }
                if (condObj.type == "OR" || condObj.type == "AND"){
                    return condObj.singleconditions.map(e=>{
                        return eventObjectToExpress(e);
                    }).join(' or ');
                }
                return JSON.stringify(condObj);
            }

            let toEventConditionExpress = (val)=>{
                if (!val){
                    return '';
                }

                try{
                    let condObj = JSON.parse(val);
                    return eventObjectToExpress(condObj);
                }catch(e){

                }
                return val;
            }

            let formartJSON = (val)=>{
                if (!val){
                    return '';
                }
                try{
                    return JSON.stringify(JSON.parse(val), '', '\t');
                }catch(e){

                }
                return val;
            }

            if (!$('.order-flow-siber').length){
                $('.orderflow-searchresult').append(`<div class="order-flow-siber"></div>`);
            }

            $('.orderflow-searchresult .order-flow-siber').html(`
                    <div>ID:<span class="value">${planitem.Id}</span></div>
                    <div>Name:<span class="value">${planitem.Name}</span></div>
                    <div>Request:<span class="value"><br/>${formartJSON(planitem.vlocity_cmt__Request__c||'')}</span></div>
                    <div>Response:<span class="value"><br/>${formartJSON(planitem.vlocity_cmt__Response__c||'')}</span></div>
                    <div>Status:<span class="value">${planitem.vlocity_cmt__State__c}</span></div>
                    <div>Type:<span class="value">${planitem.vlocity_cmt__OrchestrationItemDefinitionId__r?.RecordType.Name}</span></div>
                    <div>Implementation:<span class="value">${planitem.vlocity_cmt__OrchestrationItemDefinitionId__r?.vlocity_cmt__itemImplementationId__r?.vlocity_cmt__Implementation__c||''}</span></div>
                    <div>Implementation2:<span class="value">${planitem.vlocity_cmt__OrchestrationItemDefinitionId__r?.vlocity_cmt__SystemInterfaceId__r?.vlocity_cmt__Implementation__c||''}</span></div>
                    <div>EventCondition:<span class="value">${toEventConditionExpress(planitem.vlocity_cmt__OrchestrationItemDefinitionId__r?.vlocity_cmt__EventConditionData__c||'')}</span></div>
                    <div>Condition:<span class="value">${toEventConditionExpress(planitem.vlocity_cmt__OrchestrationItemDefinitionId__r?.vlocity_cmt__ConditionData__c||'')}</span></div>
                `);
        }
        else{
            this.showMessage('No correct order/orderitem id', 'error');
            return;
        }
    }

    createOMPlanDefine(){
        let omplan2 = new OMPlanDefine(this.allOrchestrationDependencyDefinitions, 'svgflow-showallsobjectdatatable3');
        omplan2.master = this;
        let allRecords = {};
        for (let item of this.allOrchestrationDependencyDefinitions){
            allRecords[item.vlocity_cmt__OrchestrationItemDefinitionId__c] = {
                Id: item.vlocity_cmt__OrchestrationItemDefinitionId__c,
                Name: item.vlocity_cmt__OrchestrationItemDefinitionId__r.Name,
                vlocity_cmt__OrchestrationPlanDefinitionId__c:item.vlocity_cmt__OrchestrationItemDefinitionId__r.vlocity_cmt__OrchestrationPlanDefinitionId__c
            }
            allRecords[item.vlocity_cmt__DependencyItemDefinitionId__c] = {
                Id: item.vlocity_cmt__DependencyItemDefinitionId__c,
                Name: item.vlocity_cmt__DependencyItemDefinitionId__r.Name,
                vlocity_cmt__OrchestrationPlanDefinitionId__c:item.vlocity_cmt__DependencyItemDefinitionId__r.vlocity_cmt__OrchestrationPlanDefinitionId__c
            }
        }
        omplan2.create(Object.values(allRecords));
    }

    initGroupping(allRecords){
        let id2groupMap = {};
        let n = 1;
        for (let itemDefined of allRecords){
            if (id2groupMap[itemDefined.vlocity_cmt__OrchestrationItemDefinitionId__c]){
                continue;
            }
            let results = [];
            this.grouping(itemDefined, allRecords, results);
            for (let ret of results){
                id2groupMap[ret.Id] = n;
                id2groupMap[ret.vlocity_cmt__OrchestrationItemDefinitionId__c] = n;
                id2groupMap[ret.vlocity_cmt__DependencyItemDefinitionId__c] = n;
            }
            n++;
        }
        return id2groupMap;
    }

    grouping(itemDefined, allItemDefineds, result){
        result.push(itemDefined);
        for (let tempItemDefined of allItemDefineds){
            if (result.indexOf(tempItemDefined) != -1){
                continue;
            }
            if (itemDefined.vlocity_cmt__OrchestrationItemDefinitionId__c == tempItemDefined.vlocity_cmt__DependencyItemDefinitionId__c){
                this.grouping(tempItemDefined, allItemDefineds, result);
            }
            if (itemDefined.vlocity_cmt__DependencyItemDefinitionId__c == tempItemDefined.vlocity_cmt__DependencyItemDefinitionId__c){
                this.grouping(tempItemDefined, allItemDefineds, result);
            }
            if (itemDefined.vlocity_cmt__OrchestrationItemDefinitionId__c == tempItemDefined.vlocity_cmt__OrchestrationItemDefinitionId__c){
                this.grouping(tempItemDefined, allItemDefineds, result);
            }
            if (itemDefined.vlocity_cmt__DependencyItemDefinitionId__c == tempItemDefined.vlocity_cmt__OrchestrationItemDefinitionId__c){
                this.grouping(tempItemDefined, allItemDefineds, result);
            }
        }
    }

    initProcessAllData(allRecords){
        let leftDefiniedIds = {};
        let rightDefiniedIds = {};
        let allItemDefinitions = {};
        for (let itemDefined of allRecords){
            if (itemDefined.vlocity_cmt__OrchestrationItemDefinitionId__c){
                leftDefiniedIds[itemDefined.vlocity_cmt__OrchestrationItemDefinitionId__c] = itemDefined.vlocity_cmt__OrchestrationItemDefinitionId__r.Name;
            }
            if (itemDefined.vlocity_cmt__DependencyItemDefinitionId__c){
                rightDefiniedIds[itemDefined.vlocity_cmt__DependencyItemDefinitionId__c] = itemDefined.vlocity_cmt__DependencyItemDefinitionId__r.Name;
            }
        }
        allItemDefinitions = {...rightDefiniedIds, ...leftDefiniedIds};

        this.print('leftDefiniedIds=',leftDefiniedIds);
        this.print('rightDefiniedIds=',rightDefiniedIds);

        let topOrchestrationItemDefinitions = [];
        for(let key of Object.keys(rightDefiniedIds)){
            if (!leftDefiniedIds[key]){
                topOrchestrationItemDefinitions.push(key);
            }
        }

        this.allItemDefinitions  = allItemDefinitions;
        this.topOrchestrationItemDefinitions = topOrchestrationItemDefinitions;
    }

    processData(allRecords, id2groupMap){
        
        let allItemDefinitions = {...this.allItemDefinitions};
        if (!id2groupMap){
            id2groupMap = this.initGroupping(allRecords);
        }
        

        let allSVGObjects = [];
        this.allSVGObjects = allSVGObjects;

        let stackItems = [];
        let topDefineds = [];
        for (let record of allRecords){
            if (this.topOrchestrationItemDefinitions.indexOf(record.vlocity_cmt__DependencyItemDefinitionId__c) == -1 || topDefineds.indexOf(record.vlocity_cmt__DependencyItemDefinitionId__c) != -1){
                continue;
            }
            topDefineds.push(record.vlocity_cmt__DependencyItemDefinitionId__c);
            this.print('\n<<<top=',allItemDefinitions[record.vlocity_cmt__DependencyItemDefinitionId__c]+'>>>');
            stackItems.push({id:record.vlocity_cmt__DependencyItemDefinitionId__c, next:this.getNextItems(record.vlocity_cmt__DependencyItemDefinitionId__c, allRecords)});
            
        }

        this.r = 1;
        this.c = 1;
        this.svgMap = {};
        this.print('\n\n<<<nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn>>>\n\n');

        for (let item of stackItems){
            let results = [];
            this.r = 0;
            this.nextplattomap(item, results, [], id2groupMap[item.id]);
            
            //console.log('top path=');
            // console.log(results.map(e=>{
            //     return e.map(e1=>allItemDefinitions[e1.id]).join(' => ')
            // }).join('\n'));
            let str = this.stockItemToString(item);
            this.print('>>>\ntop path=',str);
        }

        $('#flowGroup').html(this.svgObjectToHtml(allSVGObjects));
        let maxSize = this.getMaxWithAndHeight(allSVGObjects);
        $('#orderflow-view-result').css({width:maxSize.maxW+100+'px', height:maxSize.maxH+100+'px'});
    }

    stockItemToString(stackItem){
        let pre = this.allItemDefinitions[stackItem.id];
        return stackItem.next.length ? stackItem.next.map(e=>{
            return pre + ' => ' + this.stockItemToString(e);
        }).join('') : pre+'\n';
    }

    svgObjectToHtml(allSVGObjects){
        this.refreshPosition(allSVGObjects);
        return allSVGObjects.map(svg=>{
            if (svg.t == 'l'){
                return this.createSVGObjctLine(svg);
            }else if (svg.t == 't'){
                return this.createSVGObjctText(svg);
            }else if (svg.t == 'r'){
                return this.createSVGObjctRect(svg);
            }
            return '';
        }).join('\n')
    }

    getMaxWithAndHeight(allSVGObjects){
        let maxH = 0;
        let maxW = 0;
        for (let svg of allSVGObjects){
            if (svg.t == 'r'){
                maxH = Math.max(maxH, svg.y + svg.h);
                maxW = Math.max(maxW, svg.x + svg.w);
            }
        }
        return {maxH, maxW};
    }

    refreshPosition(allSVGObjects){
        for (let svg of allSVGObjects){
            if (svg.t == 'r'){
                svg.x = 100 + svg.c * this.getRectAndRectWidth() + (svg.c - 1) * this.getRectWidth();
                svg.y =  svg.r * this.getRectAndRectHeight() + (svg.r - 1) * this.getRectHeight() + this.getMaxGroupHeigth(svg.g);
                svg.w = this.getRectWidth();
                svg.h = this.getRectHeight();
            }
        }
        for (let svg of allSVGObjects){
            if (svg.t == 'l'){
                let start = svg.start;
                let end = svg.end;
                svg.x1 = start.x+start.w;
                svg.y1 = start.y+start.h/2;;
                svg.x2 = end.x;
                svg.y2 = end.y+start.h/2;
            }else if (svg.t == 't'){
                let ref = svg.ref;
                svg.x = ref.x;
                svg.y = ref.y+ref.h/2;;
            }
        }
    }

    getMaxGroupHeigth(level){
        let maxH = 0;
        for (let svg of this.allSVGObjects){
            if (svg.g < level){
                maxH = Math.max(maxH, svg.y + svg.h);
            }
        }
        return maxH;
    }

    nextplattomap(stackItem, results, parentPath, level){
        level = level || 1;
        let rect = this.toSVGObject(stackItem.id);
        if (this.allSVGObjects.indexOf(rect) == -1){
            rect.g = level;
            rect.r = this.r + 1;
            rect.c = parentPath.length + 1;
            
            this.allSVGObjects.push(rect);
            let svgTxt = this.toSVGText(this.allItemDefinitions[stackItem.id]);
            svgTxt.ref = rect;
            rect.text = svgTxt.text;
            this.allSVGObjects.push(svgTxt);
        }else{
            rect.c = Math.max(parentPath.length + 1, rect.c);
            //rect.r = Math.max(this.r + 1, rect.r);
        }

        let newCurrent = parentPath.concat([stackItem]);
        if(stackItem.next.length == 0){
            results.push(newCurrent);
            this.r++;
        }else{
            for (let item of stackItem.next){
                let childRect = this.nextplattomap(item, results, newCurrent, level);
                this.addSVGLine(rect, childRect);
            }
        }

        return rect;
    }

    getNextItems(itemId, allRecords){
        let nextList = [];
        for (let itemDefined of allRecords){
            if (itemDefined.vlocity_cmt__DependencyItemDefinitionId__c == itemId){
                nextList.push({id:itemDefined.vlocity_cmt__OrchestrationItemDefinitionId__c, next:this.getNextItems(itemDefined.vlocity_cmt__OrchestrationItemDefinitionId__c, allRecords)});
            }
        }
        return nextList;
    }
    addSVGLine(rect1, rect2){
        let line = this.toSVGLine();
        line.start = rect1;
        line.end = rect2;
        if (rect1.c >= rect2.c){
            rect2.c = rect1.c + 1;
        }
        this.allSVGObjects.push(line);
    }

    toSVGObject(ref){
        if (this.svgMap[ref]){
            return this.svgMap[ref];
        }
        let obj = {t:'r',x:0, y:0, w:0,h:0, refId:ref, id:this.getSVGId()};
        this.svgMap[ref] = obj;
        return obj;
    }

    getSVGId(){
        return 'flow_svg_'+(this.allSVGObjects.length+1)
    }

    toSVGLine(){
        return {t:'l', x1:0, y1:0, x2:0,y1:0, id:this.getSVGId()};
    }

    toSVGText(text){
        return {t:'t',x:0, y:0, text:text, id:this.getSVGId()}
    }

    createSVGObjctRect(item){
        return `<rect stroke="#000" fill="#fff" x="${item.x}" y="${item.y}" width="${item.w}" height="${item.h}" id="${item.id}"/>`
    }

    createSVGObjctLine(item){
        return `<line id="${item.id}" y2="${item.y2}" x2="${item.x2}" y1="${item.y1}" x1="${item.x1}" stroke="#000" fill="none"/>`
    }

    createSVGObjctText(item){
        return `<text fill="#000000" stroke="#000" x="${item.x}" y="${item.y}" id="${item.id}" stroke-width="0" font-size="14" font-family="Noto Sans JP" text-anchor="start" xml:space="preserve">${item.text}</text>`
    }
    
    getRectWidth(){
        return 263;
    }

    getRectHeight(){
        return 104;
    }

    getRectAndRectHeight(){
        return 83;
    }

    getRectAndRectWidth(){
        return 100;
    }

    print(){
        let args = [];
        for(let i=0;i<arguments.length;i++){
            args[i]= arguments[i];
        }
        console.log(...args);
        let lastText = $('#svgflow-notificationmessage').text();
        //$('#svgflow-notificationmessage').text(lastText + args.join(' '));
        
    }
}


class OMPlan2{

    constructor(allItemDefinitions, id){
        this.allItemDefinitions = allItemDefinitions;
        this.definitionNames = {};
        this.setNames(allItemDefinitions);
        this.id = id;
        this.svgId = 'svg-omplan-2';
        this.omPlanUIRecords = [];
        this.X_MAX = 2582;
        this.X_ADDING = 420 - 50;
        this.X_CLIENT = 320;
        this.X_INIT = 50;
        this.Y_INIT = 50;
        this.Y_ADDING = 360 - 50;
        this.Y_CLIENT = 140;
        this.X_VIEW_CLIENT = 320;
        this.Y_VIEW_CLIENT = 260;
        this.rightMap = {};
        this.toMap = {};
        this.orderitemDependecyInstances = [];
    }

    getOrderName(){
        return this.master.orderName;
    }

    getOrchestrationPlanDefinitions(id){
        return this.master.orchestrationPlanDefinitions[id];
    }

    setNames(allItemDefinitions){
        for (let item of allItemDefinitions){
            this.definitionNames[item.vlocity_cmt__DependencyItemDefinitionId__c] = item.vlocity_cmt__DependencyItemDefinitionId__r.Name;
            this.definitionNames[item.vlocity_cmt__OrchestrationItemDefinitionId__c] = item.vlocity_cmt__OrchestrationItemDefinitionId__r.Name;
        }
    }

    setAllDependencys(orchestrationItems){
        this.toMap = {};
        for (let k of orchestrationItems){
            this.toMap[k.Id] = k;
            k.deps = [];
            this.setDeps(k, orchestrationItems);
        }
    }

    setDeps(item, orchestrationItems){
        let dependeciesDefineIds = this.getDependencied(item.vlocity_cmt__OrchestrationItemDefinitionId__c);
        for (let dependencyDefinedId of dependeciesDefineIds){
            let dependencyItem = orchestrationItems.find(e => e.vlocity_cmt__OrchestrationItemDefinitionId__c == dependencyDefinedId);
            if (dependencyItem){
                if (item.deps){
                    item.deps.push(dependencyItem.Id);
                }else{
                    item.deps = [dependencyItem.Id];
                }
            }
        }
        if (this.orderitemDependecyInstances?.length){
            for (let titem of this.orderitemDependecyInstances){
                if (titem.vlocity_cmt__DependsOnItemId__c == item.Id && item.deps.indexOf(titem.vlocity_cmt__OrchestrationItemId__c) == -1){
                    item.deps.push(titem.vlocity_cmt__OrchestrationItemId__c);
                }
            }
        }
    }

    create(allRecords){
        $('#' + this.id).html(`<svg id="${this.svgId}" class="container">${this.createOMPlanFlow(allRecords)}<svg/>`)
        let maxX = this.X_INIT;
        let maxY = this.Y_INIT;
        for (let item of allRecords){
            maxX = Math.max(item.x, maxX);
            maxY = Math.max(item.y, maxY);
        }


        $('#'+this.svgId).attr('width', maxX+ this.X_ADDING);
        $('#'+this.svgId).attr('height', maxY + this.Y_ADDING);

        this.addHoverControl()
        this.addZoomControl();
        this.addClickContrl();
    }

    addHoverControl(){
        $('#' + this.id+ ' g[vlocity_cmt-xomPlanView_xomPlanView].planitem').on('mouseout', (e)=>{
            $('.hover').removeClass('hover');
        })
        $('#' + this.id+ ' g[vlocity_cmt-xomPlanView_xomPlanView].planitem').on('mouseover', (e)=>{

            $('[vlocity_cmt-xomPlanView_xomPlanView].hover').removeClass('hover');
            let id = this.getIdByG(e.currentTarget);
            $('.id-'+id).addClass('hover');
            $('path.id-'+id).each((index, ele) =>{
                let relatedIds = this.getIdsByPath(ele);
                for (let relatedId of relatedIds){
                    $('.item-content.id-'+relatedId).addClass('hover');
                }
            })
        })
    }

    addZoomControl(){
        const svgImage = document.getElementById(this.svgId);
        const svgContainer = document.getElementById(this.id);
        let w1 = $('#'+this.svgId).attr('width');
        let h1 = $('#'+this.svgId).attr('height');

        var viewBox = {x:0,y:0,w:svgImage.clientWidth||w1,h:svgImage.clientHeight||h1};
        svgImage.setAttribute('viewBox', `${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`);
        const svgSize = {w:svgImage.clientWidth||w1,h:svgImage.clientHeight||h1};
        var isPanning = false;
        var startPoint = {x:0,y:0};
        var endPoint = {x:0,y:0};;
        var scale = 1;

        svgContainer.onmousewheel = (e)=> {
            if (!e.ctrlKey){
                return;
            }
            e.preventDefault();
            // /console.log('deltaY='+e.deltaY);
            var w = viewBox.w;
            var h = viewBox.h;
            var mx = e.offsetX;//mouse x  
            var my = e.offsetY;    
            var dw = w*Math.sign(e.deltaY)*0.05*-1;
            var dh = h*Math.sign(e.deltaY)*0.05*-1;
            var dx = dw*mx/svgSize.w;
            var dy = dh*my/svgSize.h;
            viewBox = {x:viewBox.x+dx,y:viewBox.y+dy,w:viewBox.w-dw,h:viewBox.h-dh};
            scale = svgSize.w/viewBox.w;
            //zoomValue.innerText = `${Math.round(scale*100)/100}`;
            svgImage.setAttribute('viewBox', `${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`);
        }


        svgContainer.onmousedown = (e)=>{
            isPanning = true;
            startPoint = {x:e.x,y:e.y};   
        }

        svgContainer.onmousemove = (e)=>{
            if (isPanning){
                endPoint = {x:e.x,y:e.y};
                var dx = (startPoint.x - endPoint.x)/scale;
                var dy = (startPoint.y - endPoint.y)/scale;
                var movedViewBox = {x:viewBox.x+dx,y:viewBox.y+dy,w:viewBox.w,h:viewBox.h};
                svgImage.setAttribute('viewBox', `${movedViewBox.x} ${movedViewBox.y} ${movedViewBox.w} ${movedViewBox.h}`);
            }
        }

        svgContainer.onmouseup = function(e){
            if (isPanning){ 
                endPoint = {x:e.x,y:e.y};
                var dx = (startPoint.x - endPoint.x)/scale;
                var dy = (startPoint.y - endPoint.y)/scale;
                viewBox = {x:viewBox.x+dx,y:viewBox.y+dy,w:viewBox.w,h:viewBox.h};
                svgImage.setAttribute('viewBox', `${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`);
                isPanning = false;
            }
        }

        svgContainer.onmouseleave = function(e){
            isPanning = false;
        }
    }

    addClickContrl(){
        $('#' + this.id+ ' g[vlocity_cmt-xomPlanView_xomPlanView].planitem').on('dblclick', (event)=>{
            let id = this.getIdByG(event.currentTarget);
            if (id){
                this.master.query(id);
            }
            event.stopPropagation();
        })
    }

   

    setLeft(orchestrationItems){
        let toMap = {};
        this.topMap = toMap;
        for (let k of orchestrationItems){
            toMap[k.Id] = k;
            k.left = 0;
            k.top = 0;
        }
        for (let i = 0; i< orchestrationItems.length; i++){
            for (let record of orchestrationItems) {
                for (let depencyId of (record.deps || [])){
                    if (toMap[depencyId] && toMap[depencyId].left <= record.left){
                        toMap[depencyId].left = toMap[depencyId].left + 1;
                    }
                }
            }
        }
    }

    setTop(swimlanerMap){
        swimlanerMap.row = 0;
        for (let i = 0; i<swimlanerMap.swimlanes.length;i++){
            let swimlane = swimlanerMap.swimlanes[i];
            let swimlaneLeftCount = {};
            
            swimlane.items.sort((a1, b1)=>{
                if (b1.left != a1.left){
                    return b1.left - a1.left;
                }
                let bDeps = b1.deps.map(dep=>{
                    return this.toMap[dep];
                }).filter(e => e.swimlane == b1.swimlane);
                let aDeps = a1.deps.map(dep=>{
                    return this.toMap[dep];
                }).filter(e => e.swimlane == a1.swimlane);
                return bDeps.length - aDeps.length;
            })

            let topMap = {};
            for (let j = 0; j<swimlane.items.length; j++){
                let item = swimlane.items[j];

                let avgRightTop = 0;
                if (item.deps.length){
                   
                    let sameSwimlanceItems = item.deps.map(dep=>{
                        return this.toMap[dep];
                    }).filter(e => e.swimlane == swimlane);
                    if (sameSwimlanceItems.length){
                        let rightTops = sameSwimlanceItems.map(e => e.top);
                        avgRightTop = Math.floor(rightTops.reduce((sum, currentValue)=>sum+currentValue, 0) / rightTops.length);
                    }
                }

                if (!topMap[item.left+'#'+avgRightTop]){
                    item.top = avgRightTop;
                }else {
                    avgRightTop++;
                    while(topMap[item.left+'#'+avgRightTop]){
                        avgRightTop++
                    }
                    item.top = avgRightTop;
                }
                if (!swimlaneLeftCount[item.left]){
                    swimlaneLeftCount[item.left] = 1;
                }else{
                    swimlaneLeftCount[item.left]++;
                }
                topMap[item.left+'#'+item.top]=true;


                item.adjustTop = 0;
                for (let k=0; k< i; k++){
                    item.adjustTop += swimlanerMap.swimlanes[k].rows;
                }

                swimlane.rows = Math.max(swimlaneLeftCount[item.left], swimlane.rows);
            }
            swimlanerMap.row += swimlane.rows;
        }
    }

    swimlanes(allRecords){
        this.setAllDependencys(allRecords);
        this.setLeft(allRecords);

        // columns the max dependecy legnth
        let swimlanerMap = {columns:0, rows: 0, items : allRecords, lines: [], swimlanes:[]};
        
        for (let record of allRecords){
            let swimlane = swimlanerMap.swimlanes.find (e => e.planDefId == record.vlocity_cmt__OrchestrationPlanDefinitionId__c);
            if (swimlane){
                swimlane.items.push(record);
                
            } else{
                swimlane = {
                    rows: 0,
                    columns:1,
                    x: 0,
                    y:0,
                    w:0,
                    h:0,
                    planDefId: record.vlocity_cmt__OrchestrationPlanDefinitionId__c,
                    name:this.getOrchestrationPlanDefinitions(record.vlocity_cmt__OrchestrationPlanDefinitionId__c),
                    items:[record]
                };
                swimlanerMap.swimlanes.push(swimlane);
            }
            record.adjustTop = 0;
            record.swimlane = swimlane;

            swimlane.columns < record.left && (swimlane.columns = record.left);
            swimlanerMap.columns < swimlane.columns && (swimlanerMap.columns = swimlane.columns);
        }
        swimlanerMap.columns++;


        swimlanerMap.swimlanes.sort((s1, s2)=>{
            let leftWight1 = s1.items.map(e=>e.left||0).reduce((sum, curr)=>sum+curr, 0)/s1.items.length;
            let leftWight2 = s2.items.map(e=>e.left||0).reduce((sum, curr)=>sum+curr, 0)/s2.items.length;
            return leftWight1 - leftWight2;
        })

        swimlanerMap.swimlanes.forEach((e, index) => {
            e.index = index;
        })

        this.setTop(swimlanerMap);


        for (let item of allRecords){
            item.x = this.X_INIT + this.X_ADDING * item.left;
            item.y = this.Y_INIT * (item.swimlane.index + 1) + this.Y_ADDING * (item.top + item.adjustTop);
        }

        // set size
        swimlanerMap.w = swimlanerMap.columns * this.X_ADDING + this.X_INIT;
        swimlanerMap.h = swimlanerMap.rows * this.Y_ADDING + this.Y_INIT * swimlanerMap.swimlanes.length;
        

        for (let k = 0; k<swimlanerMap.swimlanes.length;k++){
            let swimlane = swimlanerMap.swimlanes[k];
            for (let t = 0; t < k; t++){
                swimlane.y += swimlanerMap.swimlanes[t].h;
            }
            swimlane.w = swimlanerMap.w;
            swimlane.h = swimlane.rows * this.Y_ADDING + this.Y_INIT;
        }

        return swimlanerMap;
    }

    getIdByG(target){
        let item = $(target).children('.item-content')[0];
        let classList = item.classList;
        let foId  = '';
        for (let i = 0; i < classList.length; i++){
            let match = classList[i].match(/id-([\d\w]+)/)
            if (match){
                foId = match[1];
                break;
            }
        }
        return foId;
    }

    getIdsByPath(target){
        let item = $(target)[0];
        let classList = item.classList;
        let foIds = [];
        for (let i = 0; i < classList.length; i++){
            let match = classList[i].match(/id-([\d\w]+)/)
            if (match){
                foIds.push(match[1]);
            }
        }
        return foIds;
    }
    getDefinitionName(definitionId){
        return this.definitionNames[definitionId] || definitionId;
    }

    getDependencies(definitionId){
        let items = [];
        for (let itemDefined of this.allItemDefinitions||[]){
            if (itemDefined.vlocity_cmt__OrchestrationItemDefinitionId__c == definitionId){
                items.push(itemDefined.vlocity_cmt__DependencyItemDefinitionId__c);
            }
        }
        return items;
    }

    getDependencied(definitionId){
        let items = [];
        for (let itemDefined of this.allItemDefinitions||[]){
            if (itemDefined.vlocity_cmt__DependencyItemDefinitionId__c == definitionId){
                items.push(itemDefined.vlocity_cmt__OrchestrationItemDefinitionId__c);
            }
        }
        return items;
    }

    createOMPlanFlow(orchestrationItems){

        this.lines = [];
        this.svgItems = [];
        this.simlaneContents = [];

        let simlanesObj = this.swimlanes(orchestrationItems);

        for (let swimlane of simlanesObj.swimlanes){
            this.simlaneContents.push(this.createSwimlaneItem(swimlane));
            for (let item of swimlane.items){
                this.createPlanUI(item);
            }
        }
        // for (let item of orchestrationItems){
        //    this.createPlanUI(item, orchestrationItems)
        // }

        return [...this.simlaneContents, ...this.lines, ...this.svgItems].join('')
    }



    createPlanUI(item){
        let uiItem = this.omPlanUIRecords[item.Id];
        if (uiItem){
            return uiItem;
        }

        uiItem = {
            id: item.Id,
            status:item.vlocity_cmt__State__c,
            label: item.Name || this.getDefinitionName(item.vlocity_cmt__OrchestrationItemDefinitionId__c),
            type: item.vlocity_cmt__OrchestrationItemType__c,
            x: item.x,
            y: item.y
        }
        this.omPlanUIRecords[item.Id] = uiItem;

        this.svgItems.push(this.createPlanItem(uiItem));

        for (let dependencyDefinedId of (item.deps||[])){
            let dependencyItem = this.topMap[dependencyDefinedId];
            if (dependencyItem){
                //this.createPlanUI(dependencyItem, orchestrationItems);
                this.lines.push(this.createPlanLine(item, dependencyItem));
            }
        }
        return uiItem;
    }

    createSwimlaneItem(swimlane){
         swimlane = swimlane || {
            x: 0,
            y:0,
            h: 'Sales Agent Notification after Stock Replenishment',
            w: 'Milestone',
            orderName:'',
            name:''
        }
        return `
        <g transform="translate(${swimlane.x}, ${swimlane.y})" vlocity_cmt-xomPlanView_xomPlanView="" class="swimlaneitem shadow id-${swimlane.planDefId}">
            <rect class="swimlane even" height="${swimlane.h}" width="${swimlane.w}" vlocity_cmt-xomPlanView_xomPlanView=""></rect>
            <foreignObject class="swimlane-text-container " x="50" y="0" width="${swimlane.w}" vlocity_cmt-xomPlanView_xomPlanView="">
                <div tabindex="0" class="swimlane-text fr " vlocity_cmt-xomplanview_xomplanview="">[${this.getOrderName()||'...'}]</div>
                <div tabindex="0" class="swimlane-text plan-def " vlocity_cmt-xomplanview_xomplanview="">${swimlane.name}</div>
            </foreignObject>
        </g>`
    }

    createPlanItem(planItem){
        let planItemDemo = {
            id: 'a3IBU000000Rvwz2AC',
            status:'completed',
            label: 'Sales Agent Notification after Stock Replenishment',
            type: 'Milestone'
        }

        // let left = 370 * planItem.left + this.X_INIT;
        // let top = (planItem === globalThis? top : planItem.top) * this.Y_ADDING + this.Y_INIT;
        // top += (m + g) * e.adjustTop;
        // r && (left = 370 * (t.columns - e. left - 1) + this.X_INIT);

        let str = `<g aria-haspopup="true" aria-controls="menu1" transform="translate(${planItem.x},${planItem.y})" class="planitem" vlocity_cmt-xomPlanView_xomPlanView="">
			<foreignObject class="item-content id-${planItem.id}" width="${this.X_VIEW_CLIENT}" height="${this.Y_VIEW_CLIENT}"
				vlocity_cmt-xomPlanView_xomPlanView="">
				<div tabindex="0" aria-label="${planItem.label}, ${planItem.type}" role="presentation" class="item-content-inner item-border item-content-inner-nojeopardy ${planItem.status}" vlocity_cmt-xomplanview_xomplanview="">
					<div class="item-name " vlocity_cmt-xomplanview_xomplanview="">
						<div class="item-header-name" vlocity_cmt-xomplanview_xomplanview="" title="${planItem.label}">${planItem.label}</div>
						<div class="item-menu-icon" tabindex="0" vlocity_cmt-xomplanview_xomplanview="" style="pointer-events: visible;">
                            <svg width="20" height="20" aria-label="Show more actions" vlocity_cmt-xomPlanView_xomPlanView="">
								<use fill="#181818" xlink:href="#httpshere2serveuatdvlocitycmtsandboxvfforcecomsldsiconsutilityspritesvgsymbolssvg_threedots" vlocity_cmt-xomPlanView_xomPlanView=""></use>
							</svg>
                        </div>
					</div>
					<div class="item-details" vlocity_cmt-xomplanview_xomplanview="">
						<div class="item-type item-type-width" vlocity_cmt-xomplanview_xomplanview="">${planItem.type}</div>
						<div class="date-container" vlocity_cmt-xomplanview_xomplanview="" style="display: none;">
							<div class="dates start-date" vlocity_cmt-xomplanview_xomplanview="" style="display: none;">
							</div>
							<div class="dates due-date" vlocity_cmt-xomplanview_xomplanview="" style="display: none;">
							</div>
						</div>
						<div class="" vlocity_cmt-xomplanview_xomplanview=""></div>
					</div>
					<div class="item-footer" vlocity_cmt-xomplanview_xomplanview="">
                        <span class="slds-badge slds-badge_lightest" vlocity_cmt-xomplanview_xomplanview="">${planItem.status}</span>
                        <span class="" vlocity_cmt-xomplanview_xomplanview=""></span>
                        <span class="external-dep-span" vlocity_cmt-xomplanview_xomplanview=""></span>
                    </div>
				</div>
			</foreignObject>
		</g>`
        return str;
    }

    createPlanLine(planItema, planItemb){
        let sourcePos = planItema;
        let targetPos = planItemb;
        if(sourcePos.x > targetPos.x || (sourcePos.x == targetPos.x && sourcePos.y > targetPos.y)){
            let temp = sourcePos;
            sourcePos = targetPos;
            targetPos = temp;
        }
        let m = {x: sourcePos.x + this.X_CLIENT, y: sourcePos.y + this.Y_CLIENT / 2};
        let t = {x: targetPos.x, y: targetPos.y + this.Y_CLIENT / 2};
        let p1 = {x:m.x+(this.X_ADDING - this.X_VIEW_CLIENT)/2, y:m.y}//{x: m.x + (t.x - m.x)/2, y:m.y};
        let p2 = {x: m.x+(this.X_ADDING - this.X_VIEW_CLIENT)/2, y:t.y};
        let path = `M${m.x},${m.y}L${p1.x},${p1.y}L${p2.x},${p2.y}L${t.x},${t.y}`;

        return `<path class="line id-${planItema.Id} id-${planItemb.Id}" d="${path}" vlocity_cmt-xomPlanView_xomPlanView=""></path>`
    }
}

class OMPlanDefine extends OMPlan2{
    constructor(allItemDefinitions, id){
        super(allItemDefinitions, id);
        this.svgId = 'svg-omplan-3';
        this.orchestrationPlanDefinitionMap = {};
    }

    create(datas){
        for (let item of datas){
            item.vlocity_cmt__State__c = '';
            item.vlocity_cmt__OrchestrationItemType__c = '';
        }
        super.create(datas)
    }

    setDeps(item, orchestrationItems){
        let dependeciesDefineIds = this.getDependencied(item.Id);
        item.deps = dependeciesDefineIds;
    }

    getOrchestrationPlanDefinitions(id){
        if (this.orchestrationPlanDefinitionMap[id]){
            return this.orchestrationPlanDefinitionMap[id];
        }
        for (let item of this.allItemDefinitions){
            if (item.vlocity_cmt__OrchestrationItemDefinitionId__r.vlocity_cmt__OrchestrationPlanDefinitionId__c == id){
                this.orchestrationPlanDefinitionMap[id] = item.vlocity_cmt__OrchestrationItemDefinitionId__r?.vlocity_cmt__OrchestrationPlanDefinitionId__r?.Name;
                break;
            }
            if (item.vlocity_cmt__DependencyItemDefinitionId__r.vlocity_cmt__OrchestrationPlanDefinitionId__c == id){
                this.orchestrationPlanDefinitionMap[id] = item.vlocity_cmt__DependencyItemDefinitionId__r?.vlocity_cmt__OrchestrationPlanDefinitionId__r?.Name;
                break;
            }
        }
        return this.orchestrationPlanDefinitionMap[id] || '';
    }

    createSwimlaneItem(swimlane){
        swimlane.name = swimlane.name + `(${swimlane.items.length})`;
        return super.createSwimlaneItem(swimlane);
    }

}