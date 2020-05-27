/**
 * 运营-合同-详情
 */

layui.use(['element', 'form', 'Dialog', 'Req', 'Common', 'OTree', 'Print', 'Regex', 'laydate', 'upload', 'MUpload', 'DateRangeUtil', 'Approval', 'Flow'], function() {
    var $ = layui.jquery,
        form = layui.form,
        laydate = layui.laydate,
        element = layui.element;
    var Common = layui.Common;
    var Req = layui.Req;
    var Regex = layui.Regex;
    var Dialog = layui.Dialog;
    var MUpload = layui.MUpload;
    var DateRangeUtil = layui.DateRangeUtil;
    var Approval = layui.Approval;
    var Flow = layui.Flow;

    var compareData = {},
        compare = false;
    // 初始页面加载只执行一次
    var changeFlag = true;

    // 免租期验证
    function validateFreeDate() {
        var flag = true;
        var $contractFreeBegins = $('input[name^=contractFreeBeginDate]');
        if($contractFreeBegins.length) {
            for(var i = 0, len = $contractFreeBegins.length; i < len; i++) {
                var $curDateGroup = $contractFreeBegins.eq(i).parents('.dateGroup'),
                    $freeBegin = $curDateGroup.find('input[name^=contractFreeBeginDate]'),
                    $freeEnd = $curDateGroup.find('input[name^=contractFreeEndDate]'),
                    begin = $freeBegin.val(),
                    end = $freeEnd.val();

                if((begin && !end)) {
                    Dialog.errorDialog("免租期结束日期未填");
                    $freeEnd.addClass('layui-form-danger');
                    flag = false;
                    break;
                }

                if(!begin && end) {
                    Dialog.errorDialog("免租期开始日期未填");
                    $freeBegin.addClass('layui-form-danger');
                    flag = false;
                    break;
                }

                if(begin && end) {
                    // 日期比较
                    if(!Common.Util.compareDate(begin, end)) {
                        Dialog.errorDialog("免租期开始日期不得大于结束日期");
                        $freeBegin.addClass('layui-form-danger');
                        flag = false;
                        break;
                    }
                }
            }
        }

        return flag;
    }
    function getFreeDate() {
        var freeDateArr = [];
        var $contractFreeBegins = $('input[name^=contractFreeBeginDate]');
        if($contractFreeBegins.length) {
            for(var i = 0, len = $contractFreeBegins.length; i < len; i++) {
                var $curDateGroup = $contractFreeBegins.eq(i).parents('.dateGroup'),
                    $freeBegin = $curDateGroup.find('input[name^=contractFreeBeginDate]'),
                    $freeEnd = $curDateGroup.find('input[name^=contractFreeEndDate]'),
                    begin = $freeBegin.val(),
                    end = $freeEnd.val();

                if(begin && end) {
                    freeDateArr.push({
                        begin: begin,
                        end: end
                    });
                }
            }
        }
        return freeDateArr;
    }


    function getFreeDate2() {
        var freeDateArr = [];
        var $contractFreeBegins = $('input[name^=contractFreeBeginDate]');
        if($contractFreeBegins.length) {
            for(var i = 0, len = $contractFreeBegins.length; i < len; i++) {
                var $curDateGroup = $contractFreeBegins.eq(i).parents('.dateGroup'),
                    $freeBegin = $curDateGroup.find('input[name^=contractFreeBeginDate]'),
                    $freeEnd = $curDateGroup.find('input[name^=contractFreeEndDate]'),
                    begin = $freeBegin.val(),
                    end = $freeEnd.val();
                if(begin || end) {
                    freeDateArr.push(begin + '~' + end);
                }
            }
        }
        return freeDateArr;
    }

    // 发起变更、续租时，检测底价单位是否已换
    function checkPriceUnitIsChange() {
        var $isChange = $('input[name=isChange2]');

        return $isChange.val() == '1' && changeFlag;
    }

    // 房源相关数据（租金\租金单价等）
    function initHouseRelatedData(type) {
        return {
            rentPrice: '',
            roomNames: '',
            roomAreas: '',
            rentUnit: '',
            propertyPrice: '',
            propertyUnit: ''
        }
    }

    // 待比较数据
    function getCompareData() {
        var data = form.val('component-form-group');

        compareData = $.extend(true, {}, data);
        compareData.square = {};
        compareData.fixed = {};
        var $square = $('.square'),
            $fixed = $('.fixed');
        if($square.length) {
            compareData.square.rentPrice = $square.find('input[name^=rentPrice]').val();
            compareData.square.roomNames = $square.find('input[name^=roomNames]').val();
            compareData.square.roomIds = $square.find('input[name^=roomIds]').val();
            compareData.square.roomAreas = $square.find('input[name^=roomAreas]').val();
            compareData.square.rentUnit = $square.find('input[name^=rentUnit]').val();
            compareData.square.propertyPrice = $square.find('input[type=text][name^=propertyPrice]').val();
            compareData.square.propertyUnit = $square.find('input[name^=propertyUnit]').val();
        } else {
            compareData.square = initHouseRelatedData();
        }

        if($fixed.length) {
            compareData.fixed.rentPrice = $fixed.find('input[name^=rentPrice]').val();
            compareData.fixed.roomNames = $fixed.find('input[name^=roomNames]').val();
            compareData.fixed.roomIds = $fixed.find('input[name^=roomIds]').val();
            compareData.fixed.roomAreas = $fixed.find('input[name^=roomAreas]').val();
            compareData.fixed.rentUnit = $fixed.find('input[name^=rentUnit]').val();
            compareData.fixed.propertyPrice = $fixed.find('input[type=text][name^=propertyPrice]').val();
            compareData.fixed.propertyUnit = $fixed.find('input[name^=propertyUnit]').val();
        } else {
            compareData.fixed = initHouseRelatedData();
        }
        console.log(compareData);
    }


    function init() {
        var pathname = location.pathname;
        if(pathname == '/operatecontract/changeaudit') {
            // 合同变更
            getCompareData();
            compare = true;
        }
        renderDatebox();

        if(checkPriceUnitIsChange()) {
            setTimeout(function () {
                $('.selectHouse').trigger('click');
            },0);
        }


        MUpload({
            elem: $('.upload'),
            size: 1024 * 50,
            choose:function(){},
        });
    }

    function renderDatebox() {
        lay('.datebox').each(function(){
            laydate.render({
                elem: this,
                // showBottom: false,
                btns: ['clear', 'now'],
                trigger: 'click',
                done: function (value, date, endDate) {
                    if(compare) {
                        var $elem = $(this.elem),
                            key = $elem.attr('data-key'),
                            name = $elem.attr('name');

                        // 租期
                        if(name == 'contractBeginDate' || name == 'contractEndDate') {
                            var contractBeginDate = $('input[name=contractBeginDate]').val(),
                                contractEndDate = $('input[name=contractEndDate]').val();

                            if((contractBeginDate + contractEndDate) == (compareData.contractBeginDate + compareData.contractEndDate)) {
                                $('.changeTxt_' + key).addClass('hidden');
                            } else {
                                $('.changeTxt_' + key).removeClass('hidden');
                            }
                        }

                        // 免租期
                        if((name.indexOf('contractFreeBeginDate') != -1) || (name.indexOf('contractFreeEndDate') != -1)) {
                            var freeDateArr = getFreeDate2();
                            if(compareData.contractFreePeriod == freeDateArr.join('/')) {
                                $('.changeTxt_' + key).addClass('hidden');
                            } else {
                                $('.changeTxt_' + key).removeClass('hidden');
                            }
                        }
                    }
                }
            });
        });
    }

    function renderEndDateBox(Date) {
        lay('.endDateBox').each(function(){
            laydate.render({
                elem: this,
                trigger: 'click',
                // showBottom: false,
                btns: ['clear', 'now'],
                value: Date
            });
        });
    }

    // 生成缴费通知单
    function getExportNoticeDialogHtml() {
        var _html = '<div class="layui-card-body">' +
                        '<form class="layui-form" action="" lay-filter="formDialog">' +
                            '<div class="layui-form-item">' +
                                '<label class="layui-form-label text-w-120">生成应收日期在</label>' +
                                '<div class="layui-input-inline text-w-100">' +
                                    '<input type="text" name="end_date" lay-verify="date" placeholder="yyyy-MM-dd"  autocomplete="off" class="layui-input endDateBox">'+
                                '</div>' +
                                '<div class="layui-form-mid">之前的</div>' +
                            '</div>' +
                            '<div class="layui-form-item">' +
                                '<div class="layui-input-block" style="margin-left: 30px;">' +
                                    '<input type="radio" name="notice_type" value="1" title="租金缴纳通知单" checked>' +
                                '</div>' +
                            '</div>' +
                            '<div class="layui-form-item">' +
                                '<div class="layui-input-block" style="margin-left: 30px;">' +
                                    '<input type="radio" name="notice_type" value="2" title="电费缴纳通知单">' +
                                '</div>' +
                            '</div>' +
                            '<!--写一个隐藏的btn -->' +
                            '<button class="submitBtn" lay-submit lay-filter="bind" style="display: none;">' +
                            '</button>' +
                        '</form>' +
                        '</div>';
        return _html;
    }

    function getUpdateInfoDialogHtml(title, name, type) {
        var _html = '<div class="layui-card-body">' +
                        '<form class="layui-form" action="" lay-filter="formDialog">' +
                            '<div class="layui-form-item">' +
                                '<label class="layui-form-label">'+ title +'</label>' +
                                '<div class="layui-input-inline" style="width: 260px;">';
        if(type == '1') {
            _html += '<input type="text" name="name" value="'+ name +'" lay-verify="required" maxlength="10"  lay-reqText="请填写联系人" placeholder="请填写联系人" autocomplete="off" class="layui-input">';
        } else if(type == '2') {
            _html += '<input type="text" name="name" value="'+ name +'" lay-verify="required|phone"  lay-reqText="请填写手机号码" placeholder="请填写手机号码" autocomplete="off" class="layui-input">';
        }
        _html +=
                                '</div>' +
                            '</div>' +
                            '<!--写一个隐藏的btn -->' +
                            '<button class="submitBtn" lay-submit lay-filter="bind" style="display: none;">' +
                            '</button>' +
                        '</form>' +
                    '</div>';
        return _html;
    }

    // 免租期
    function getFreeDateHtml() {
        var _html = '<div class="layui-input-block clearfix mb-10">' +
                    '<div class="dateGroup">' +
                        '<div class="layui-input-inline">' +
                            '<input type="text" class="layui-input test-laydate-item datebox" data-key="5" name="contractFreeBeginDate[]" lay-verify="date" placeholder="yyyy-MM-dd" value="" autocomplete="off">' +
                        '</div>' +
                        '<div class="layui-form-mid">-</div>' +
                        '<div class="layui-input-inline">' +
                            '<input type="text" class="layui-input test-laydate-item datebox" data-key="5" name="contractFreeEndDate[]" lay-verify="date" placeholder="yyyy-MM-dd" value="" autocomplete="off">' +
                        '</div>' +
                        '<div class="layui-form-mid">' +
                            '<a href="javascript:;" class="c-orange delFreeDate" title="删除"><i class="iconfont ibs-ico-deletenorml"></i></a>' +
                        '</div>' +
                    '</div>' +
                    '</div>';
        return _html;
    }


    function getChangeTypeDialogHtml(parkCharge) {
        var _html = '<div class="layui-card-body">' +
                        '<form class="layui-form" action="" lay-filter="formDialog">' +
                            '<div class="layui-form-item">' +
                                '<div class="layui-input-block" style="margin-left: 0;">' +
                                    '<input type="radio" name="type" value="1" title="常规变更" checked>' +
                                '</div>' +
                                '<div class="layui-input-block" style="margin-left: 0;">可用于租期、免租期、单价、保证金、支付方式或收费计划等信息的变更（纸质合同需要同步变更，会经过盖章环节）</div>'+
                            '</div>' +
                            '<div class="layui-form-item">' +
                                '<div class="layui-input-block" style="margin-left: 0;">' +
                                    '<input type="radio" name="type" value="2" title="企业抬头变更">' +
                                '</div>' +
                                '<div class="layui-input-block" style="margin-left: 0;">仅支持企业抬头的变更，不支持合同其他条款及收费计划的调整（纸质合同需要同步变更，会经过盖章环节）</div>' +
                            '</div>';
        if(parkCharge == '1') {
            _html += '<div class="layui-form-item">' +
                        '<div class="layui-input-block" style="margin-left: 0;">' +
                            '<input type="radio" name="type" value="3" title="系统合同收费计划修正">' +
                        '</div>' +
                        '<div class="layui-input-block" style="margin-left: 0;">仅支持系统合同收费计划的修正（不涉及纸质合同变更，因此无需经过盖章环节）</div>' +
                    '</div>';
        }
        _html +=
                            '<!--写一个隐藏的btn -->' +
                            '<button class="submitBtn" lay-submit lay-filter="bind" style="display: none;">' +
                            '</button>' +
                        '</form>' +
                    '</div>';
        return _html;
    }

    /**
     * 房源选择组件
     * @param unit
     * @returns {string}
     */

    function getInfo(list) {
        var sum = 0,
            roomNames = {},
            roomArea = [],
            roomIds = [],
            basePrice = [],
            propertyPrice = [];
        list.forEach(function(item, index) {
            sum = Common.Util.accAdd(sum, item.roomArea);

            var buildName = item.buildName;
            if(!roomNames[buildName]) {
                roomNames[buildName] = [];
            }
            roomNames[buildName].push(item.roomName);
            roomArea.push(item.roomArea);
            roomIds.push(item.roomId);
            basePrice.push(item.basePrice);
            propertyPrice.push(item.propertyPrice);
        });

        var result = [];
        for(var key in roomNames) {
            result.push(key + '-' + roomNames[key].join(','))
        }

        return {
            area: sum,
            roomNames: result.join(','),
            roomIds: roomIds.join(','),
            roomArea: roomArea.join(','),
            roomAreas: sum,
            basePrice: basePrice.join(','),
            propertyPrice: propertyPrice.join(','),
            rentUnit: list[0].rentUnit,
            propertyUnit: list[0].propertyUnit,
        }
    }

    function getUnit(unit) {
        if(unit == '1') {
            return '元/㎡/月';
        } else if(unit == '2') {
            return '元/㎡/天';
        } else {
            return '元/天';
        }
    }

    /**
     * 房源底价计算
     */
    // 房源为按面积计费
    function calcBasePrice(list) {
        // 按面积计算底价 =  ∑（房源面积*底价）/ ∑ （房源面积）
        var totalSquare = 0, totalPrice = 0;
        list.forEach(function(item, index) {
            totalSquare = Common.Util.accAdd(totalSquare, item.roomArea);
            totalPrice = Common.Util.accAdd(totalPrice, Common.Util.accMul(item.basePrice, item.roomArea));
        });
        return Common.Util.accDiv(totalPrice, totalSquare).toFixed(2);
    }

    // 房源为一口价计费
    function calcBasePrice2(list) {
        // 一口价计算房源租金底价 =  ∑（房源1底价+…+房源N底价）
        var sum = 0;
        list.forEach(function(item, index) {
            sum = Common.Util.accAdd(sum, item.basePrice);
        });
        return sum.toFixed(2);
    }

    function compareRoomIds(roomIds, compRoomIds) {
        var roomIdArr = roomIds.split(',').sort(function (a, b) {
            return a - b;
        });


        var compRoomIdArr;
        if(!compRoomIds) {
            compRoomIdArr = [];
        } else {
            compRoomIdArr = compRoomIds.split(',').sort(function (a, b) {
                return a - b;
            });
        }

        var roomIdStr = roomIdArr.join(','),
            compRoomIdStr = compRoomIdArr.join(',');

        return roomIdStr == compRoomIdStr;
    }

    function getHouseDetailHtml(data) {
        // console.log(data);
        if(!data.squarePrice.length && !data.fixedPrice.length) {
            return '';
        }
        var _html = '<div class="sign-details">';
        if(data.squarePrice.length) {
            // 按面积
            _html += '<div class="layui-form-item label-l mb-10">' +
                '<label class="layui-form-label">房源</label>' +
                '<div class="layui-input-block">' +
                '<div class="layui-form-mid">' + getInfo(data.squarePrice).roomNames + '<span class="c-gray-light">（共计'+ getInfo(data.squarePrice).area +'㎡）</span></div>';
            // if(compare && (getInfo(data.squarePrice).roomNames != compareData.square.roomNames || getInfo(data.squarePrice).area != compareData.square.roomAreas)) {
            //     _html += '<div class="layui-form-mid"><span class="layui-badge">变更</span></div>';
            // }
            if(compare && !compareRoomIds(getInfo(data.squarePrice).roomIds, compareData.square.roomIds)) {
                _html += '<div class="layui-form-mid"><span class="layui-badge">变更</span></div>';
            }
            _html +=    '</div>' +
                '</div>' +
                '<div class="layui-form-item label-l mb-10 square">' +
                '<div class="layui-inline inline-02">' +
                '<label class="layui-form-label"><span class="c-orange">* </span>租金单价</label>' +
                '<div class="layui-input-block">' +
                '<div class="layui-input-inline text-w-150">' +
                '<input type="text" class="layui-input rentPrice" data-key="100" name="rentPrice[]" lay-verify="required|onlyDecmal8Ex0" data-base="' + calcBasePrice(data.squarePrice) + '" data-rent-unit="' + data.squarePrice[0].rentUnit + '">' +
                '<input type="hidden" name="roomNames[]" value="' + getInfo(data.squarePrice).roomNames + '">' +
                '<input type="hidden" name="roomArea[]" value="'+ getInfo(data.squarePrice).roomArea +'">' +
                '<input type="hidden" name="roomAreas[]" value="' + getInfo(data.squarePrice).roomAreas + '">' +
                '<input type="hidden" name="roomIds[]" value="' + getInfo(data.squarePrice).roomIds + '">' +
                '<input type="hidden" name="rentUnit[]" value="' + getInfo(data.squarePrice).rentUnit + '">' +
                '<input type="hidden" name="basePrice[]" value="' + getInfo(data.squarePrice).basePrice + '">' +
                '<input type="hidden" name="propertyPrice2[]" value="' + getInfo(data.squarePrice).propertyPrice + '">' +
                '</div>' +
                '<div class="layui-form-mid">' + data.squarePrice[0].rentUnitStr + '<span class="c-gray-light">（即：</span><span class="c-gray-light convert">'+ getUnit(data.squarePrice[0].rentUnit) +'</span><span class="c-gray-light">）</span></div>' +
                '<div class="layui-form-mid"><span class="layui-badge changeTxt_100 hidden">变更</span></div>' +
                '</div>' +
                '</div>' +
                '<div class="layui-inline inline-02">' +
                '<label class="layui-form-label"><span class="c-orange">* </span>物业服务费单价</label>' +
                '<div class="layui-input-block">' +
                '<div class="layui-input-inline text-w-150">' +
                '<input type="text" class="layui-input propertyPrice" data-key="101" name="propertyPrice[]" data-property-unit="'+ data.squarePrice[0].propertyUnit +'" lay-verify="required|onlyDecmal8Ex0">' +
                '<input type="hidden" name="propertyUnit[]" value="' + getInfo(data.squarePrice).propertyUnit + '">' +
                '</div>' +
                '<div class="layui-form-mid">' + data.squarePrice[0].propertyUnitStr + '</div>' +
                '<div class="layui-form-mid"><span class="layui-badge changeTxt_101 hidden">变更</span></div>' +
                '</div>' +
                '</div>' +
                '</div>';
        }
        if(data.fixedPrice.length) {
            // 按一口价
            _html += '<div class="layui-form-item label-l mb-10">' +
                '<label class="layui-form-label">房源</label>' +
                '<div class="layui-input-block">' +
                '<div class="layui-form-mid">' + getInfo(data.fixedPrice).roomNames + '<span class="c-gray-light">（共计'+ getInfo(data.fixedPrice).area +'㎡）</span><span class="layui-badge ml-5 oneprice" style="display: none;">一口价</span></div>';
            // if(compare && (getInfo(data.fixedPrice).roomNames != compareData.fixed.roomNames || getInfo(data.fixedPrice).area != compareData.fixed.roomAreas)) {
            //     _html += '<div class="layui-form-mid"><span class="layui-badge">变更</span></div>';
            // }
            if(compare && !compareRoomIds(getInfo(data.fixedPrice).roomIds, compareData.fixed.roomIds)) {
                _html += '<div class="layui-form-mid"><span class="layui-badge">变更</span></div>';
            }
            _html +=    '</div>' +
                '</div>' +
                '<div class="layui-form-item label-l mb-10 fixed">' +
                '<div class="layui-inline inline-02">' +
                '<label class="layui-form-label"><span class="c-orange">* </span>租金</label>' +
                '<div class="layui-input-block">' +
                '<div class="layui-input-inline text-w-150">' +
                '<input type="text" class="layui-input rentPrice" data-key="102" name="rentPrice[]" lay-verify="required|onlyDecmal8Ex0" data-base="'+ calcBasePrice2(data.fixedPrice) +'" data-rent-unit="'+ data.fixedPrice[0].rentUnit +'">' +
                '<input type="hidden" name="roomNames[]" value="'+ getInfo(data.fixedPrice).roomNames +'">' +
                '<input type="hidden" name="roomArea[]" value="'+ getInfo(data.fixedPrice).roomArea +'">' +
                '<input type="hidden" name="roomAreas[]" value="'+ getInfo(data.fixedPrice).roomAreas +'">' +
                '<input type="hidden" name="roomIds[]" value="'+ getInfo(data.fixedPrice).roomIds +'">' +
                '<input type="hidden" name="rentUnit[]" value="'+ getInfo(data.fixedPrice).rentUnit +'">' +
                '<input type="hidden" name="basePrice[]" value="'+ getInfo(data.fixedPrice).basePrice +'">' +
                '<input type="hidden" name="propertyPrice2[]" value="'+ getInfo(data.fixedPrice).propertyPrice +'">' +
                '</div>' +
                '<div class="layui-form-mid">'+ data.fixedPrice[0].rentUnitStr +'<span class="c-gray-light">（即：</span><span class="c-gray-light convert">'+ getUnit(data.fixedPrice[0].rentUnit) +'</span><span class="c-gray-light">）</span></div>' +
                '<div class="layui-form-mid"><span class="layui-badge changeTxt_102 hidden">变更</span></div>' +
                '</div>' +
                '</div>' +
                '<div class="layui-inline inline-02">' +
                '<label class="layui-form-label"><span class="c-orange">* </span>物业服务费</label>' +
                '<div class="layui-input-block">' +
                '<div class="layui-input-inline text-w-150">' +
                '<input type="text" class="layui-input propertyPrice" data-key="103" name="propertyPrice[]" data-property-unit="'+ data.fixedPrice[0].propertyUnit +'" lay-verify="required|onlyDecmal8Ex0">' +
                '<input type="hidden" name="propertyUnit[]" value="'+ getInfo(data.fixedPrice).propertyUnit +'">' +
                '</div>' +
                '<div class="layui-form-mid">'+ data.fixedPrice[0].propertyUnitStr +'</div>' +
                '<div class="layui-form-mid"><span class="layui-badge changeTxt_103 hidden">变更</span></div>' +
                '</div>' +
                '</div>' +
                '</div>';
        }

        _html += '</div>';

        return _html;
    }

    $(function() {
        init();

        Approval();

        // 租期
        $(document).on('blur', 'input[name=contractBeginDate], input[name=contractEndDate]', function () {
            var $o = $(this),
                key = $o.attr('data-key'),
                date = $o.val();

            if(!Regex.date.reg.test(date) && date) {
                Dialog.errorDialog(Regex.date.msg);
                return false;
            }

            var $contractBeginDate = $('input[name=contractBeginDate]'),
                $contractEndDate = $('input[name=contractEndDate]');

            if(($contractBeginDate.val() + $contractEndDate.val()) == (compareData.contractBeginDate + compareData.contractEndDate)) {
                $('.changeTxt_' + key).addClass('hidden');
            } else {
                $('.changeTxt_' + key).removeClass('hidden');
            }
        });

        // 免租期
        $(document).on('blur', 'input[name^=contractFreeBeginDate], input[name^=contractFreeEndDate]', function () {
            var $o = $(this),
                key = $o.attr('data-key'),
                value = $o.val();

            if(!Regex.date.reg.test(value) && value) {
                Dialog.errorDialog(Regex.date.msg);
                return false;
            }

            var freeDateArr = getFreeDate2();
            if(compareData.contractFreePeriod == freeDateArr.join('/')) {
                $('.changeTxt_' + key).addClass('hidden');
            } else {
                $('.changeTxt_' + key).removeClass('hidden');
            }
        });

        // 房源选择
        $(document).on('click', '.selectHouse', function() {

            var $o = $(this),
                url = $('#selectHouse').val();
            var $selectRoomInput = $('input[name=selectRoomIds]'),
                $selectParkInput = null;

            Common.selectHouse(url, $selectRoomInput, $selectParkInput, function (data) {
                $('.houseDetail').html(getHouseDetailHtml(data));

                if(data.squarePrice.length || data.fixedPrice.length) {
                    $('.houseRoomDiv').html('<span class="allHouseDiv">' + data.allHouse + '</span>');
                } else {
                    $('.houseRoomDiv').html('');
                }

                $('input[name=selectRoomIds]').val(data.roomIds.join(','));
                $('input[name=selectRoomNames]').val(data.allHouse);
                $('input[name=selectTotalArea]').val(data.totalArea);
            }, function(layero) {
                if(checkPriceUnitIsChange()) {
                    setTimeout(function () {
                        changeFlag = false;
                        layero.hide();
                        layero.find('.layui-layer-btn0').trigger('click');
                    },0);
                }
            });
        });

        // 租金单价
        $(document).on('blur', '.rentPrice', function() {
            var $o = $(this),
                key = $o.attr('data-key'),
                $target = $o.parent().next().find('.convert'),
                $parent = $o.parent(),
                rentUnit = $o.attr('data-rent-unit'),
                convert = '';
            if(!Regex.onlyDecmal8Ex0.reg.test($o.val())) {
                Dialog.errorDialog(Regex.onlyDecmal8Ex0.msg);
                return false;
            }
            if(rentUnit == '1') {
                // 日租金->月租金（元/㎡/天 -> 元/㎡/月）
                convert = Common.Util.accDiv(Common.Util.accMul($o.val(), 365), 12).toFixed(2) + '元/㎡/月';
            } else if(rentUnit == '2') {
                // 月租金->日租金（元/㎡/月 -> 元/㎡/天）
                convert = Common.Util.accDiv(Common.Util.accMul($o.val(), 12), 365).toFixed(2) + '元/㎡/天';
            } else {
                // 一口价
                convert = Common.Util.accDiv(Common.Util.accMul($o.val(), 12), 365).toFixed(2) + '元/天';
            }
            $target.text(convert);

            if($parent.find('.convertPrice').length) {
                $parent.find('.convertPrice').val(convert);
            } else {
                $parent.append('<input type="hidden" class="convertPrice" name="convertPrice[]" value="'+ convert +'">');
            }

            if(compare) {
                // 变更提示
                if(rentUnit == '3') {
                    // 一口价
                    if($o.val() != compareData.fixed.rentPrice || rentUnit != compareData.fixed.rentUnit) {
                        $('.changeTxt_' + key).removeClass('hidden');
                    } else {
                        $('.changeTxt_' + key).addClass('hidden');
                    }
                } else {
                    // 按面积
                    if($o.val() != compareData.square.rentPrice || rentUnit != compareData.square.rentUnit) {
                        $('.changeTxt_' + key).removeClass('hidden');
                    } else {
                        $('.changeTxt_' + key).addClass('hidden');
                    }
                }
            }
        });

        // 物业服务费单价
        $(document).on('blur', '.propertyPrice', function() {
            var $o = $(this),
                key = $o.attr('data-key'),
                propertyUnit = $o.attr('data-property-unit');
            if(!Regex.onlyDecmal8Ex0.reg.test($o.val())) {
                Dialog.errorDialog(Regex.onlyDecmal8Ex0.msg);
                return false;
            }

            if(compare) {
                // 变更提示
                if(propertyUnit == '3') {
                    // 一口价
                    if($o.val() != compareData.fixed.propertyPrice || propertyUnit != compareData.fixed.propertyUnit) {
                        $('.changeTxt_' + key).removeClass('hidden');
                    } else {
                        $('.changeTxt_' + key).addClass('hidden');
                    }
                } else {
                    // 按面积
                    if($o.val() != compareData.square.propertyPrice || propertyUnit != compareData.square.propertyUnit) {
                        $('.changeTxt_' + key).removeClass('hidden');
                    } else {
                        $('.changeTxt_' + key).addClass('hidden');
                    }
                }
            }
        });

        // 添加免租期
        $(document).on('click', '.addMoreFreeDate', function() {
            $('.moreFreeDate').append(getFreeDateHtml());
            renderDatebox();
        });

        // 删除免租期
        $(document).on('click', '.delFreeDate', function () {
            $(this).parent().parent().parent().remove();

            var freeDateArr = getFreeDate2();
            if(compareData.contractFreePeriod == freeDateArr.join('/')) {
                $('.changeTxt_5').addClass('hidden');
            } else {
                $('.changeTxt_5').removeClass('hidden');
            }
        });

        // 续租后保证金
        $(document).on('blur', 'input[name=new_bond_1], input[name=new_bond_2]', function () {
           var $o = $(this),
               $curBondDiv = $o.parents('.bondDiv'),
               $endMoney = $curBondDiv.find('.endMoney');
           var status = $('input[name=bzj]:checked').val(),
               money = parseFloat($o.val()),
               oldBond = parseFloat($('input[name=oldbond]').val());
            money = isNaN(money) ? 0 : money;

            var changeMoney = '';

           if(status == '1') {
               // 增加
               changeMoney = Common.Util.accAdd(money, oldBond);
               $endMoney.text(Common.Util.number_format(parseFloat(changeMoney), 2));
           } else if(status == '2') {
               // 减少
               // 保证金减少不能大于原保证金
               changeMoney = Common.Util.accSub(money, oldBond, 2);
               if(parseFloat(changeMoney) < 0) {
                   Dialog.errorDialog('保证金减少不能大于原保证金');
                   $o.val('');
                   return false;
               }
               $endMoney.text(Common.Util.number_format(parseFloat(changeMoney), 2));
           } else {
               // 维持不变
           }

           if(compare) {
               if(parseFloat(changeMoney) == parseFloat(compareData.oldbond)) {
                   $curBondDiv.find('.layui-badge').addClass('hidden');
               } else {
                   $curBondDiv.find('.layui-badge').removeClass('hidden');
               }
           }
        });

        // 续租\退租清算
        $(document).on('click', '.normalDialog', function() {
            var $o = $(this),
                message = $o.attr('data-message'),
                btnTxt = $o.attr('data-button'),
                url = $o.attr('data-url');

            var btn = ['知道了'];
            if(btnTxt) {
                btn = [btnTxt];
            }

            Dialog.tipDialog({
                content: message,
                btn: btn,
                yesFn: function(index, layero) {
                    if(url) {
                        window.location.href = url;
                    }
                    layer.close(index);
                }
            })
        });

        // 变更
        $(document).on('click', '.changeTypeDialog', function () {
            var url = $(this).attr('data-url');
            var parkCharge = $(this).attr('data-park-charge');

            Dialog.confirmDialog({
                title: '选择变更类型',
                content: getChangeTypeDialogHtml(parkCharge),
                success: function (layero, index) {
                    form.render(null, 'formDialog');
                },
                yesFn: function (index, layero) {
                    var type = layero.find('input[name=type]:checked').val();
                    window.location.href = url + '&type=' + type;
                }
            })
        });

        // 撤销、取消退租
        $(document).on('click', '.ajaxApplyCancel', function () {
            var $o = $(this),
                url = $o.attr('data-url'),
                applyType = $o.attr('data-apply-type'),
                title = $o.attr('value'),
                message = $o.attr('data-message'),
                $form = $('form');

            var param = $form.serializeArray();
            param.push({name: 'applyType', value: applyType});

            Dialog.confirmDialog({
                title: title,
                content: message,
                yesFn: function (index, layero) {
                    Req.postReqCommon(url, param);
                }
            });
        });

        // 提交盖章
        $(document).on('click', '.ajaxSeal', function () {
            var $o = $(this),
                url = $o.attr('data-url'),
                applyType = $o.attr('data-apply-type'),
                message = $o.attr('data-message'),
                $form = $('form');

            var param = $form.serializeArray();
            param.push({name: 'applyType', value: applyType});

            Dialog.confirmDialog({
                title: '提交盖章',
                btn: ['确定', '再核对下'],
                content: message,
                yesFn: function (index, layero) {
                    Req.postReqCommon(url, param);
                }
            });
        });

        // 联系人\手机号码修改
        $(document).on('click', '.ajaxUpdateInfo', function() {
            var $o = $(this),
                type = 1,       // 1: 联系人   2：手机号码
                $infoSpan = $o.prev(),
                url = $o.attr('data-url'),
                // name = $o.attr('data-name'),
                name = $infoSpan.text(),
                title = $o.attr('data-title');

            if(title == '手机号码') {
                type = 2;
            }

            Dialog.formDialog({
                title: '修改信息',
                content: getUpdateInfoDialogHtml(title, name, type),
                success: function (layero, index) {
                    var $form = layero.find('form');
                    form.on('submit(bind)', function (data) {
                        var param = $form.serializeArray();
                        Req.postReq(url, param, function (res) {
                            if(res.status) {
                                Dialog.successDialog(res.msg, function () {
                                    $infoSpan.text(data.field.name);
                                    layer.close(index);
                                });
                            } else {
                                Dialog.errorDialog(res.msg);
                            }
                        });
                        return false;
                    });
                }
            })
        });

        // 历史收费计划
        $(document).on('click', '.foldUp', function () {
            var $o = $(this),
                $curIbsCollapse = $o.parents('.ibs-collapse'),
                $ibsCollaContent = $curIbsCollapse.find('.ibs-colla-content');

            if($ibsCollaContent.length) {
                if($o.hasClass('ibs-ico-foldup')) {
                    $ibsCollaContent.slideUp();
                    $o.removeClass('ibs-ico-foldup').addClass('ibs-ico-folddown');
                } else {
                    $ibsCollaContent.slideDown();
                    $o.removeClass('ibs-ico-folddown').addClass('ibs-ico-foldup');
                }
            }

        });

        // 保证金
        form.on('radio(bzj)', function (data) {
            var $elem = $(data.elem),
                $target = $elem.parent().next();
            $('.bondDiv').removeClass('block');
            $('.bondDiv').addClass('hidden');
            $target.removeClass('hidden');

            $('.bondDiv').find('input').val('');
            $('.endMoney').text(Common.Util.number_format($('input[name=oldbond]').val(), 2));
            // $('input[name=new_bond_value]').attr('disabled', true);
            // $target.find('input[name=new_bond_value]').attr('disabled', false);
        });

        /**
         * 变更比对
         */
        $(document).on('change', '.changeInput', function () {
           var $o = $(this),
               oldValue = $o.attr('data-value'),
               key = $o.attr('data-key'),
               curValue = $o.val();
           var $changeTxt = $('.changeTxt_' + key);

           if(oldValue === curValue) {
               $changeTxt.addClass('hidden');
           } else {
               $changeTxt.removeClass('hidden');
           }
        });

        // 支付方式
        form.on('select(paymethod)', function (data) {
            var $elem = $(data.elem),
                key = $elem.attr('data-key');
            var $changeTxt = $('.changeTxt_' + key);

            if(data.value == compareData.paymethod) {
                $changeTxt.addClass('hidden');
            } else {
                $changeTxt.removeClass('hidden');
            }
        });

        /**
         * 退租验收-审核通过
         * @param param
         * @returns {string}
         */
        function getRefundPassDialogHtml() {
            var _html = '<div class="layui-card-body">' +
                            '<form class="layui-form" action="" lay-filter="formDialog">' +
                                '<div class="layui-form-item">' +
                                    '<label class="layui-form-label" style="width: 40px;">备注</label>' +
                                    '<div class="layui-input-block" style="margin-left: 80px;">' +
                                        '<textarea placeholder="可填写相关备注信息，项目上人员不可见(非必填)" maxlength="500" class="layui-textarea" name="reason"></textarea>' +
                                    '</div>' +
                                '</div>' +
                                '<!--写一个隐藏的btn -->' +
                                '<button class="submitBtn" lay-submit lay-filter="bind" style="display: none;">' +
                                '</button>' +
                            '</form>' +
                        '</div>';
            return _html;
        }

        /**
         * 退租验收-退回修改
         * @param param
         * @returns {string}
         */
        function getRefundRefuseDialogHtml() {
            var _html = '<div class="layui-card-body">' +
                            '<form class="layui-form" action="" lay-filter="formDialog">' +
                                '<div class="layui-form-item">' +
                                    '<label class="layui-form-label"><span class="c-orange">* </span>退回原因</label>' +
                                    '<div class="layui-input-block">' +
                                        '<textarea placeholder="请填写退回原因" maxlength="500" lay-verify="required"  lay-reqText="请填写退回原因" class="layui-textarea" name="reason"></textarea>' +
                                    '</div>' +
                                '</div>' +
                                '<!--写一个隐藏的btn -->' +
                                '<button class="submitBtn" lay-submit lay-filter="bind" style="display: none;">' +
                                '</button>' +
                            '</form>' +
                        '</div>';
            return _html;
        }

        // 退租验收-审核通过
        $(document).on('click', '#refundSubmit', function () {
            var url = $(this).attr('data-url');
            Dialog.formDialog({
                title: '审核通过',
                content: getRefundPassDialogHtml(),
                success: function (layero, index) {
                    var $form = layero.find('form');

                    form.on('submit(bind)', function(data) {
                        var param = $form.serializeArray();
                        Req.postReqCommon(url, param);
                        return false;
                    })
                }
            });
        });

        // 退租验收-退回修改
        $(document).on('click', '#refundBack', function () {
            var url = $(this).attr('data-url');
            Dialog.formDialog({
                title: '退回修改',
                content: getRefundRefuseDialogHtml(),
                success: function (layero, index) {
                    var $form = layero.find('form');

                    form.on('submit(bind)', function(data) {
                        var param = $form.serializeArray();
                        Req.postReqCommon(url, param);
                        return false;
                    })
                }
            });
        });

        // 合同-在租-变更中(提交财务确认)
        $(document).on('click', '.ajaxSubmitFinance', function () {
            var url = $(this).attr('data-url'),
                $form = $('form');
            var data = $form.serializeArray();

            if(paymentlist && paymentlist.length) {
                data.push({name: 'paymentlist', value: JSON.stringify(paymentlist)});
            }

            Req.postReqCommon(url, data);
        });

        // 续租\变更
        form.on('submit(saveauditSubmit)', function (data) {
           var $form = $('form'),
               $elem = $(data.elem),
               url = $elem.attr('data-url'),
               flowUrl = $elem.attr('data-flow-url');

            if($('input[name=selectRoomIds]').length && !$('input[name=selectRoomIds]').val()) {
                Dialog.errorDialog('未选择房源');
                return false;
            }

            // 租期
            var $contractBeginDate = $('input[name=contractBeginDate]'),
                $contractEndDate = $('input[name=contractEndDate]');

            if($contractBeginDate.length && $contractEndDate.length) {
                if(!Common.Util.compareDate($contractBeginDate.val(), $contractEndDate.val())) {
                    Dialog.errorDialog("租期开始日期不得大于结束日期");
                    return false;
                }
            }

            // 免租期
            if($('input[name^=contractFreeBeginDate]').length) {
                if(validateFreeDate()) {
                    var freeDateArr = getFreeDate();

                    if(!checkContractFreeDate(freeDateArr)) {
                        Dialog.errorDialog("免租期时间段出现重叠，请重新选择");
                        return false;
                    }
                    var newData = [];
                    freeDateArr.forEach(function (item, index) {
                        newData.push(item.begin + '~' + item.end);
                    });
                    $('input[name=contractFreePeriod]').val(newData.join('/'));
                } else {
                    return false;
                }
            }

            // 退租原因
            if($('input[name^="refundreason"]').length) {
                var $refundReasonActive = $('input[name^="refundreason"]:checked');
                if(!$refundReasonActive.length) {
                    Dialog.errorDialog('至少选择一个退租原因');
                    return false;
                }
                var activeReasonTxt = [];
                $refundReasonActive.each(function (i, o) {
                    activeReasonTxt.push($(o).attr('title'));
                });
                $('input[name=applyReasonValue]').val(activeReasonTxt.join(','));
            }

            // 退租凭证
            if(location.pathname == '/operatecontract/refundaudit' && !$('.upload-list .upload-file-item').length) {
                Dialog.errorDialog('请上传退租凭证');
                return false;
            }

            Common.Util.replaceSerializeName2($form);
            var param = $form.serializeArray();

            param.push({name: 'applyType', value: $elem.attr('data-apply-type')});

            Flow.handleFlowByForm(flowUrl, url, param);

            // Req.postReqCommon(url, param);
            return false;
        });

        form.on('submit(saveapprovalauditSubmit)', function (data) {
            var $form = $('form'),
                $elem = $(data.elem),
                submitUrl = $elem.attr('data-url'),
                applyType = $elem.attr('data-apply-type'),          // 2: 续租    3：变更
                flowUrl = $elem.attr('data-flow-url');
                // checkUrl = $elem.attr('data-check-url');

            if($('input[name=selectRoomIds]').length && !$('input[name=selectRoomIds]').val()) {
                Dialog.errorDialog('未选择房源');
                return false;
            }

            // 租期
            var $contractBeginDate = $('input[name=contractBeginDate]'),
                $contractEndDate = $('input[name=contractEndDate]');

            if($contractBeginDate.length && $contractEndDate.length) {
                if(!Common.Util.compareDate($contractBeginDate.val(), $contractEndDate.val())) {
                    Dialog.errorDialog("租期开始日期不得大于结束日期");
                    return false;
                }
            }

            // 免租期
            if($('input[name^=contractFreeBeginDate]').length) {
                if(validateFreeDate()) {
                    var freeDateArr = getFreeDate();

                    if(!checkContractFreeDate(freeDateArr)) {
                        Dialog.errorDialog("免租期时间段出现重叠，请重新选择");
                        return false;
                    }
                    var newData = [];
                    freeDateArr.forEach(function (item, index) {
                        newData.push(item.begin + '~' + item.end);
                    });
                    $('input[name=contractFreePeriod]').val(newData.join('/'));
                } else {
                    return false;
                }
            }

            // 退租原因
            if($('input[name^="refundreason"]').length) {
                var $refundReasonActive = $('input[name^="refundreason"]:checked');
                if(!$refundReasonActive.length) {
                    Dialog.errorDialog('至少选择一个退租原因');
                    return false;
                }
                var activeReasonTxt = [];
                $refundReasonActive.each(function (i, o) {
                    activeReasonTxt.push($(o).attr('title'));
                });
                $('input[name=applyReasonValue]').val(activeReasonTxt.join(','));
            }


            Common.Util.replaceSerializeName2($form);
            var param = $form.serializeArray();

            param.push({name: 'applyType', value: $elem.attr('data-apply-type')});

            if(applyType == '2') {
                Flow.handleFlowByForm(flowUrl, submitUrl, param);

                // Req.postReq(flowUrl, param, function (res) {
                //     param.push({name: 'flow', value: res.data.flow});
                //     if (res.status) {
                //         Req.postReqCommon(submitUrl, param);
                //     } else {
                //         // 弹框提示
                //         Dialog.confirmDialog({
                //             title: '提示',
                //             content: res.msg,
                //             btn: ['提交审批', '取消'],
                //             yesFn: function (index, layero) {
                //                 Req.postReqCommon(submitUrl, param);
                //             }
                //         });
                //     }
                // })
            } else if(applyType == '3') {
                // 变更
                if(isChange()) {
                    // 变更过
                    param.push({name: 'isChange', value: 1});
                } else {
                    // 无变更
                    param.push({name: 'isChange', value: 0});
                }
                Flow.handleFlowByForm(flowUrl, submitUrl, param);
                // Req.postReq(flowUrl, param, function (res) {
                //     param.push({name: 'flow', value: res.data.flow});
                //     if (res.status) {
                //         Req.postReqCommon(submitUrl, param);
                //     } else {
                //         // 弹框提示
                //         Dialog.confirmDialog({
                //             title: '提示',
                //             content: res.msg,
                //             btn: ['提交审批', '取消'],
                //             yesFn: function (index, layero) {
                //                 Req.postReqCommon(submitUrl, param);
                //             }
                //         });
                //     }
                // })
            }

            return false;
        })


        /**
         * 时间段重合验证
         * @param dur1
         * @param dur2
         * @returns {boolean}
         */
        function checkDateRange(dur1, dur2) {
            var a = dur1.begin,
                b = dur1.end,
                x = dur2.begin,
                y = dur2.end;

            a = new Date(a).getTime();
            b = new Date(b).getTime();
            x = new Date(x).getTime();
            y = new Date(y).getTime();

            if(y < a || b < x) {
                // 不重合
                return true;
            } else {
                // 重合
                return false;
            }
        }

        // 免租期验证
        function checkContractFreeDate(freeDateArr) {

            // 时间段重合验证
            if(freeDateArr && freeDateArr.length) {
                var len = freeDateArr.length;
                for(var i = 0; i < len; i++) {
                    for(var j = 0; j < len; j++) {
                        if(i != j) {
                            // 不需要与自身比
                            return checkDateRange(freeDateArr[i], freeDateArr[j]);
                        }
                    }
                }
            }
            return true;
        }

        // 租金单价、物业费单价、电费单价低于系统底价，将启用【变更优惠审批单】
        function isChange() {
            // var $rentPrices = $('.rentPrice'),
            //     $propertyPrices = $('.propertyPrice');
            //
            // var flag = false;
            // $rentPrices.each(function (i, o) {
            //     var key = $(o).attr('data-key');
            //     if(!$('.changeTxt_' + key).hasClass('hidden')) {
            //         flag = true;
            //         return false;
            //     }
            // });
            // if(!flag) {
            //     $propertyPrices.each(function (i, o) {
            //         var key = $(o).attr('data-key');
            //         if(!$('.changeTxt_' + key).hasClass('hidden')) {
            //             flag = true;
            //             return false;
            //         }
            //     });
            // }
            //
            // return flag;


            var $badges = $('.houseDetail').find('.layui-badge').not('.oneprice');
            var flag = false;
            $badges.each(function (i, o) {
                if($(o).is(":visible")) {
                    flag = true;
                    return false;
                }
            });

            return flag;
        }

        // 生成缴费通知单
        $(document).on('click', '.exportNotice', function () {
            var url = $(this).attr('data-url');
            Dialog.formDialog({
                title: '生成缴费通知单',
                content: getExportNoticeDialogHtml(),
                success: function (layero, index) {
                    var $form = layero.find('form');
                    var date = DateRangeUtil.getCurrentMonth();
                    renderEndDateBox(date[1]);
                    form.render(null, 'formDialog');

                    form.on('submit(bind)', function (data) {
                        var param = $form.serializeArray();
                        Req.postReq(url, param, function (res) {
                            if(res.status) {
                                layer.close(index);
                                Dialog.downloadDialog({
                                    downloadUrl: res.data.url
                                });
                            } else {
                                Dialog.errorDialog(res.msg);
                            }
                        });

                        return false;
                    });
                }
            })
        });

        // 申请退租
        form.on('submit(saveSubmit)', function (data) {
            var $form = $('form'),
                param = $form.serializeArray();
            var url = $(data.elem).attr('data-url');

            if(!$('.upload-file-item').length) {
                Dialog.errorDialog('未上传退租凭证');
                return false;
            }

            Req.postReqCommon(url, param);
            return false;
        });

        form.on('submit', function (data) {
            return false;
        })
    });
});