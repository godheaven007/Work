/**
 * 房源-电表
 */

layui.use(['element', 'form', 'Dialog', 'Req', 'Common', 'Regex', 'Pager', 'laydate','upload', 'MUpload', 'ListModule', 'DateRangeUtil'], function() {
    var $ = layui.jquery,
        form = layui.form,
        laydate = layui.laydate,
        device = layui.device(),
        element = layui.element;
    var Common = layui.Common;
    var Req = layui.Req;
    var Regex = layui.Regex;
    var Pager = layui.Pager;
    var Dialog = layui.Dialog;
    var MUpload = layui.MUpload;
    var ListModule = layui.ListModule;
    var DateRangeUtil = layui.DateRangeUtil;

    function init() {
        ListModule.init(function () {
            $('input[name=allChargeList]').prop('checked', false);
            form.render();
        });
    }

    function renderDatebox() {
        lay('.datebox').each(function(){
            laydate.render({
                elem: this,
                trigger: 'click',
                btns: ['clear', 'now']
            });
        });
    }

    function lessThanToday() {
        var curDate = Common.Util.dateFormat(new Date(new Date().getTime()), 'yyyy-MM-dd');
        lay('.lessThanToday').each(function(){
            laydate.render({
                elem: this,
                // showBottom: false,
                btns: ['clear', 'now'],
                max: curDate,
                trigger: 'click'
            });
        });
    }

    function gtThanToday() {
        var curDate = Common.Util.dateFormat(new Date(new Date().getTime()), 'yyyy-MM-dd');
        lay('.gtThanToday').each(function(){
            laydate.render({
                elem: this,
                // showBottom: false,
                btns: ['clear', 'now'],
                min: curDate,
                trigger: 'click'
            });
        });
    }

    function lessTodayGtLast(lastDate) {
        var curDate = Common.Util.dateFormat(new Date(new Date().getTime()), 'yyyy-MM-dd');
        lay('.lessTodayGtLast').each(function(){
            laydate.render({
                elem: this,
                min: lastDate,
                max: curDate,
                // showBottom: false,
                btns: ['clear', 'now'],
                trigger: 'click'
            });
        });
    }

    function getMaxReadingOpts() {
        var opts = '<option value="">请选择</option>';

        maxReadingArr.forEach(function (v, k) {
            opts += '<option value="'+ v +'">'+ v +'</option>';
        });
        return opts;
    }

    // 添加电表
    function getMeterDialogHtml(selecthouseurl) {
        var _html = '<div class="layui-card-body" style="height: 380px; overflow-y: scroll;">' +
                        '<form class="layui-form" action="" lay-filter="formDialog">' +
                            '<div class="layui-form-item label-l">' +
                                '<label class="layui-form-label text-w-100"><span class="c-orange">* </span>房间号</label>' +
                                '<div class="layui-input-inline text-w-250">' +
                                    '<input type="text" name="roomnum" id="choosehouse" readonly data-url="'+selecthouseurl+'" lay-verify="required"  lay-reqText="请添加房间号" required placeholder="请添加房间号" autocomplete="off" class="layui-input" >'+
                                    '<input type="hidden" name="roomid" id="roomid" />' +
                                '</div>' +
                            '</div>' +
                            '<div class="layui-form-item label-l">' +
                                '<label class="layui-form-label text-w-100"><span class="c-orange">* </span>电表编号</label>' +
                                '<div class="layui-input-inline text-w-250">' +
                                    '<input type="text" name="ammeternum" maxlength="15" lay-verify="required"  lay-reqText="请填写电表编号" required placeholder="请填写电表编号" autocomplete="off" class="layui-input" >'+
                                '</div>' +
                                '<div class="layui-form-mid">' +
                                    '<input type="checkbox" name="virtal" lay-filter="virtal" lay-skin="primary" value="1" title="虚拟电表">' +
                                '</div>' +
                            '</div>' +
                            '<div class="layui-form-item label-l">' +
                                '<label class="layui-form-label text-w-100"><span class="c-orange">* </span>初始读数</label>' +
                                '<div class="layui-input-inline text-w-250">' +
                                    '<input type="text" name="initReading" lay-verify="required|onlyDecmal14"  lay-reqText="请填写初始读数" required placeholder="请填写初始读数" autocomplete="off" class="layui-input" >'+
                                '</div>' +
                            '</div>' +
                            '<div class="layui-form-item label-l">' +
                                '<label class="layui-form-label text-w-100"><span class="c-orange">* </span>初始抄表日期</label>' +
                                '<div class="layui-input-inline text-w-250">' +
                                    '<input type="text" name="initReadingDate" lay-verify="required|date" placeholder="请填写初始抄表日期"  lay-reqText="请填写初始抄表日期" autocomplete="off" class="layui-input lessThanToday">'+
                                '</div>' +
                            '</div>' +
                            '<div class="layui-form-item label-l">' +
                                '<label class="layui-form-label text-w-100"><span class="c-orange">* </span>最大读数</label>' +
                                '<div class="layui-input-inline text-w-250">' +
                                    '<select name="maxreading" lay-verify="required" lay-filter="maxreading">' +
                                        getMaxReadingOpts() +
                                    '</select>' +
                                '</div>' +
                            '</div>' +
                            '<div class="layui-form-item label-l" style="margin-bottom: 0;">' +
                                '<label class="layui-form-label text-w-100"><span class="c-orange">* </span>倍率</label>' +
                                '<div class="layui-input-inline text-w-250">' +
                                    '<input type="text" name="mulrate" lay-verify="required|onlyOneInteger"  lay-reqText="请填写倍率" required placeholder="请填写倍率" autocomplete="off" class="layui-input" >'+
                                '</div>' +
                            '</div>' +
                            '<div class="layui-form-item label-l">' +
                                '<label class="layui-form-label text-w-100"></label>' +
                                '<div class="layui-input-inline text-w-250">' +
                                    '<div style="color: #666;">例如：电流比是400/5,倍率则为80</div>' +
                                '</div>' +
                            '</div>' +
                            '<div class="layui-form-item label-l">' +
                                '<label class="layui-form-label text-w-100">备注</label>' +
                                '<div class="layui-input-inline text-w-250">' +
                                    '<textarea placeholder="请填写备注" maxlength="500"  lay-reqText="请填写备注" class="layui-textarea" name="remark" id="remark"></textarea>' +
                                '</div>' +
                            '</div>' +
                            '<!--写一个隐藏的btn -->' +
                            '<button class="submitBtn" lay-submit lay-filter="bind" style="display: none;">' +
                            '</button>' +
                        '</form>' +
                    '</div>';
        return _html;
    }

    // 编辑电表
    function getMeterEditDialogHtml(config) {
        var _html = '';
        if(config.initMeter == 3 || config.initMeter == 4) {
            _html += '<div class="notice-tips" style="background: #fff7e9; color:#FF9933; border:none; line-height: 24px; text-indent: 2em;">此电表的原挂靠房间被“删除”或者被“拆分”，请重新挂靠！</div>';
        }
        _html +=
            '<div class="layui-card-body" style="height: 350px; overflow-y: scroll;">' +
                        '<form class="layui-form" action="" lay-filter="formDialog">' +
                            '<div class="layui-form-item label-l">' +
                                '<label class="layui-form-label text-w-100"><span class="c-orange">* </span>房间号</label>';
        if(config.initMeter == 1 || config.initMeter == 2) {
            _html += '<div class="layui-form-mid">' +
                        config.roomName +
                        '<input type="hidden" name="roomid" value="'+ config.roomId +'" id="roomid" />' +
                     '</div>';
        } else {
            _html += '<div class="layui-input-inline text-w-250">' +
                        '<input type="text" name="roomnum" value="'+ config.roomName +'" id="choosehouse" readonly data-url="'+ config.selectHouseUrl +'" lay-verify="required"  lay-reqText="请添加房间号" required placeholder="请添加房间号" autocomplete="off" class="layui-input" >' +
                        '<input type="hidden" name="roomid" value="'+ config.roomId +'" id="roomid" />' +
                    '</div>';
        }
        _html +=            '</div>' +
                            '<div class="layui-form-item label-l">' +
                                '<label class="layui-form-label text-w-100"><span class="c-orange">* </span>电表编号</label>' +
                                '<div class="layui-input-inline text-w-250">' +
                                    '<input type="text" name="ammeternum" value="'+ config.meterNum +'" maxlength="15" lay-verify="required"  lay-reqText="请填写电表编号" required placeholder="请填写电表编号" autocomplete="off" class="layui-input" >'+
                                '</div>' +
                                '<input type="checkbox" name="virtal" lay-filter="virtal" lay-skin="primary" title="虚拟电表">' +
                                // '<div class="layui-form-mid">' +
                                //     '<input type="checkbox" name="virtal" lay-filter="virtal" lay-skin="primary" title="虚拟电表">' +
                                // '</div>' +
                            '</div>';
        if(config.initMeter == 2) {
            _html += '<div class="layui-form-item label-l">' +
                        '<label class="layui-form-label text-w-100"><span class="c-orange">* </span>初始读数</label>' +
                        '<div class="layui-form-mid">'+ config.latestReading +'</div>' +
                    '</div>' +
                    '<div class="layui-form-item label-l">' +
                        '<label class="layui-form-label text-w-100"><span class="c-orange">* </span>初始抄表日期</label>' +
                        '<div class="layui-form-mid">'+ config.initRecordAt +'</div>' +
                    '</div>';
        } else if(config.initMeter == 1 || config.initMeter == 4) {
            _html += '<div class="layui-form-item label-l">' +
                        '<label class="layui-form-label text-w-100"><span class="c-orange">* </span>初始读数</label>' +
                        '<div class="layui-input-inline text-w-250">' +
                            '<input type="text" name="initReading" value="'+ config.latestReading +'" lay-verify="required|onlyDecmal14"  lay-reqText="请填写初始读数" required placeholder="请填写初始读数" autocomplete="off" class="layui-input" >'+
                        '</div>' +
                    '</div>' +
                    '<div class="layui-form-item label-l">' +
                        '<label class="layui-form-label text-w-100"><span class="c-orange">* </span>初始抄表日期</label>' +
                        '<div class="layui-input-inline text-w-250">' +
                            '<input type="text" name="initReadingDate" value="'+ config.initRecordAt +'" lay-verify="required|date" placeholder="请填写初始抄表日期"  lay-reqText="请填写初始抄表日期" autocomplete="off" class="layui-input lessThanToday">'+
                        '</div>' +
                    '</div>';
        }

        // 重新挂靠抄表读数、日期
        if(config.initMeter == 3) {
            _html += '<div class="layui-form-item label-l">' +
                        '<label class="layui-form-label text-w-100"><span class="c-orange">* </span>末次抄表读数</label>' +
                        '<div class="layui-form-mid">'+ config.lastRead +'</div>' +
                    '</div>' +
                    '<div class="layui-form-item label-l">' +
                        '<label class="layui-form-label text-w-100"><span class="c-orange">* </span>末次抄表日期</label>' +
                        '<div class="layui-form-mid">'+ config.lastDt +'</div>' +
                    '</div>' +
                    '<div class="layui-form-item label-l">' +
                        '<label class="layui-form-label text-w-100"><span class="c-orange">* </span>重新挂靠抄表读数</label>' +
                        '<div class="layui-input-inline text-w-250">' +
                            '<input type="text" name="anewReading" lay-verify="required|onlyDecmal14"  lay-reqText="请填写重新挂靠抄表读数" required placeholder="请填写重新挂靠抄表读数" autocomplete="off" class="layui-input" >'+
                        '</div>' +
                    '</div>' +
                    '<div class="layui-form-item label-l">' +
                        '<label class="layui-form-label text-w-100"><span class="c-orange">* </span>重新挂靠抄表日期</label>' +
                        '<div class="layui-input-inline text-w-250">' +
                            '<input type="text" name="anewReadingDate" lay-verify="required|date" placeholder="请填写重新挂靠抄表日期"  lay-reqText="请填写重新挂靠抄表日期" autocomplete="off" class="layui-input lessThanToday">'+
                        '</div>' +
                    '</div>';
        }
        _html +=
                            '<div class="layui-form-item label-l">' +
                                '<label class="layui-form-label text-w-100"><span class="c-orange">* </span>最大读数</label>' +
                                '<div class="layui-input-inline text-w-250">' +
                                    '<select name="maxreading" lay-verify="required" lay-filter="maxreading">' +
                                        getMaxReadingOpts() +
                                    '</select>' +
                                '</div>' +
                            '</div>' +
                            '<div class="layui-form-item label-l" style="margin-bottom: 0;">' +
                                '<label class="layui-form-label text-w-100"><span class="c-orange">* </span>倍率</label>' +
                                '<div class="layui-input-inline text-w-250">' +
                                    '<input type="text" name="mulrate" value="'+ config.ratio +'" lay-verify="required|onlyOneInteger"  lay-reqText="请填写倍率" required placeholder="请填写倍率" autocomplete="off" class="layui-input" >'+
                                '</div>' +
                            '</div>' +
                            '<div class="layui-form-item label-l">' +
                                '<label class="layui-form-label text-w-100"></label>' +
                                '<div class="layui-input-inline text-w-250">' +
                                    '<div style="color: #666;">例如：电流比是400/5,倍率则为80</div>' +
                                '</div>' +
                            '</div>' +
                            '<div class="layui-form-item label-l">' +
                                '<label class="layui-form-label text-w-100">备注</label>' +
                                '<div class="layui-input-inline text-w-250">' +
                                    '<textarea placeholder="请填写备注" maxlength="500" class="layui-textarea" name="remark" id="remark">'+ config.remark +'</textarea>' +
                                '</div>' +
                            '</div>' +
                            '<!--写一个隐藏的btn -->' +
                            '<button class="submitBtn" lay-submit lay-filter="bind" style="display: none;">' +
                            '</button>' +
                        '</form>' +
                    '</div>';
        return _html;
    }

    // 停用电表
    function getMeterStopDialogHtml(config) {
        var _html = '<div class="layui-card-body" style="height: 350px; overflow-y: scroll;">' +
            '<form class="layui-form" action="" lay-filter="formDialog">' +
                '<div class="layui-form-item label-l">' +
                    '<label class="layui-form-label text-w-100">房间号</label>' +
                    '<div class="layui-form-mid">'+ config.roomName +'</div>' +
                '</div>' +
                '<div class="layui-form-item label-l">' +
                    '<label class="layui-form-label text-w-100">电表编号</label>' +
                    '<div class="layui-input-inline text-w-250">' +
                        '<input type="text" name="meternum" value="'+ config.meterNum +'" readonly required autocomplete="off" class="layui-input" style="border:none; padding-left: 0;">'+
                    '</div>' +
                '</div>'+
                '<div class="layui-form-item label-l">' +
                    '<label class="layui-form-label text-w-100">上次抄表读数</label>' +
                    '<div class="layui-form-mid">'+ config.latestReading +'</div>' +
                '</div>' +
                '<div class="layui-form-item label-l">' +
                    '<label class="layui-form-label text-w-100"><span class="c-orange">* </span>停用时读数</label>' +
                    '<div class="layui-input-inline text-w-250">' +
                        '<input type="text" name="stopReading" lay-verify="required|onlyDecmal14"  lay-reqText="请填写停用时读数" required placeholder="请填写停用时读数" autocomplete="off" class="layui-input">'+
                    '</div>' +
                '</div>'+
                '<div class="layui-form-item label-l">' +
                    '<label class="layui-form-label text-w-100"><span class="c-orange">* </span>停用日期</label>' +
                    '<div class="layui-input-inline text-w-250">' +
                        '<input type="text" name="stopDate" lay-verify="required|date" placeholder="请填写停用日期"  lay-reqText="请填写停用日期" autocomplete="off" class="layui-input lessTodayGtLast">'+
                    '</div>' +
                '</div>' +
                '<div class="layui-form-item label-l">' +
                    '<label class="layui-form-label text-w-100">备注</label>' +
                    '<div class="layui-input-inline text-w-250">' +
                        '<textarea placeholder="请填写备注" maxlength="500" class="layui-textarea" name="remark" id="remark"></textarea>' +
                    '</div>' +
                '</div>' +
                '<div class="layui-form-item label-l">' +
                    '<label class="layui-form-label text-w-100"><span class="c-orange">* </span>电表照片</label>' +
                    '<div class="layui-input-inline" style="width: 300px;">' +
                        '<div class="upload-wrapper">' +
                            '<div class="upload-box">' +
                                '<button type="button" class="layui-btn upload"><i class="layui-icon"></i>上传</button><input class="layui-upload-file" type="file" accept="" name="file">' +
                                '<div class="describe" style="margin-left: 5px;">单个文件不超过2M，最多可上传1个</div>' +
                            '</div>' +
                        '<div class="upload-list"></div>' +
                    '</div>' +
                '</div>' +
                '</div>' +
                '<!--写一个隐藏的btn -->' +
                '<button class="submitBtn" lay-submit lay-filter="bind" style="display: none;">' +
                '</button>' +
            '</form>' +
            '</div>';
        return _html;
    }
    
    // 查看电表(停用后)
    function getMeterViewDialogHtml(config) {
        var _html = '<div class="layui-card-body" style="height: 350px; overflow-y: scroll;">' +
                        '<form class="layui-form" action="" lay-filter="formDialog">' +
                            '<div class="layui-form-item label-l">' +
                                '<label class="layui-form-label text-w-100">房间号</label>' +
                                '<div class="layui-form-mid">'+ config.houseName +'</div>' +
                            '</div>' +
                            '<div class="layui-form-item label-l">' +
                                '<label class="layui-form-label text-w-100">电表编号</label>' +
                                '<div class="layui-form-mid">'+ config.meterNum + config.meterTypeText +'</div>' +
                            '</div>' +
                            '<div class="layui-form-item label-l">' +
                                '<label class="layui-form-label text-w-100">上次抄表读数</label>' +
                                '<div class="layui-form-mid">'+ config.preReading +'</div>' +
                            '</div>' +
                            '<div class="layui-form-item label-l">' +
                                '<label class="layui-form-label text-w-100">停用时读数</label>' +
                                '<div class="layui-form-mid">'+ config.stopReading +'</div>' +
                            '</div>' +
                            '<div class="layui-form-item label-l">' +
                                '<label class="layui-form-label text-w-100">停用日期</label>' +
                                '<div class="layui-form-mid">'+ config.stopDate +'</div>' +
                            '</div>' +
                            '<div class="layui-form-item label-l">' +
                                '<label class="layui-form-label text-w-100">备注</label>' +
                                '<div class="layui-form-mid">'+ config.remark +'</div>' +
                            '</div>' +
                            '<div class="layui-form-item label-l">' +
                                '<label class="layui-form-label text-w-100">电表照片</label>' +
                                '<div class="layui-form-mid">' +
                                    '<a href="'+ config.stopSrc +'" target="_blank">' +
                                        '<img src="'+ config.stopSrc +'" width="80" height="80">' +
                                    '</a>' +
                                '</div>' +
                            '</div>' +
                        '</form>' +
                    '</div>';
        return _html;
    }

    // 电价标准
    function getStandPirceDialogHtml(price) {
        var _html = '<div class="layui-card-body">' +
                        '<form class="layui-form" action="" lay-filter="formDialog">' +
                            '<div class="layui-form-item label-l">' +
                                '<label class="layui-form-label text-w-100"><span class="c-orange">* </span>电价标准</label>' +
                                '<div class="layui-input-inline text-w-250">' +
                                    '<input type="text" value="'+ price +'" name="standardPrice" id="price" lay-verify="required|onlyDecmal8"  lay-reqText="请填写电价标准" required placeholder="请填写电价标准" autocomplete="off" class="layui-input" >'+
                                '</div>' +
                                '<div class="layui-form-mid">元/度</div>' +
                            '</div>' +
                            '<!--写一个隐藏的btn -->' +
                            '<button class="submitBtn" lay-submit lay-filter="bind" style="display: none;">' +
                            '</button>' +
                        '</form>' +
                    '</div>';
        return _html;
    }

    // 电价调整
    function getAdjustPriceDialogHtml(param) {
        var _html = '<div class="layui-card-body">' +
                        '<form class="layui-form" action="" lay-filter="formDialog">' +
                            '<div class="layui-form-item label-l">' +
                                '<label class="layui-form-label text-w-100">企业名称</label>' +
                                '<div class="layui-form-mid">'+ param.customerName +'</div>'+
                            '</div>' +
                            '<div class="layui-form-item label-l">' +
                                '<label class="layui-form-label text-w-100">电价</label>' +
                                '<div class="layui-form-mid">'+ param.oldPrice +'元/度</div>'+
                            '</div>' +
                            '<div class="layui-form-item label-l">' +
                                '<label class="layui-form-label text-w-100"><span class="c-orange">* </span>调整后单价</label>' +
                                '<div class="layui-input-inline text-w-250">' +
                                    '<input type="text" value="'+ param.newPrice +'" name="adjustPrice" id="adjustPrice" lay-verify="required|onlyDecmal8de3"  lay-reqText="请填写调整后单价" required placeholder="请填写调整后单价" autocomplete="off" class="layui-input" >'+
                                '</div>' +
                                '<div class="layui-form-mid">元/度</div>' +
                            '</div>' +
                            '<div class="layui-form-item label-l">' +
                                '<label class="layui-form-label text-w-100"><span class="c-orange">* </span>生效日期</label>' +
                                '<div class="layui-input-inline text-w-250">' +
                                    '<input type="text" name="validateDate" value="'+ param.effectiveDate +'" lay-verify="required|date" placeholder="请填写生效日期"  lay-reqText="请填写生效日期" autocomplete="off" class="layui-input gtThanToday">'+
                                '</div>' +
                            '</div>' +
                            '<div class="layui-form-item label-l">' +
                                '<label class="layui-form-label text-w-100"></label>' +
                                '<div class="layui-input-inline" style="width: 300px;">' +
                                    '<p><span class="c-orange">说明：自生效日期起新抄电表将按调整后的电费单价计算电费（即抄表日期≥生效日期的抄表）</span></p>' +
                                '</div>' +
                            '</div>' +
                            '<!--写一个隐藏的btn -->' +
                            '<button class="submitBtn" lay-submit lay-filter="bind" style="display: none;">' +
                            '</button>' +
                        '</form>' +
                    '</div>';
        return _html;
    }

    // 批量电价调整
    function getBatchAdjustPriceDialogHtml() {
        var _html = '<div class="layui-card-body">' +
                        '<form class="layui-form" action="" lay-filter="formDialog">' +
                            '<div class="layui-form-item label-l">' +
                                '<label class="layui-form-label text-w-100"><span class="c-orange">* </span>调整后单价</label>' +
                                '<div class="layui-input-inline text-w-250">' +
                                    '<input type="text" value="" name="afterCharge" id="adjustPrice" lay-verify="required|onlyDecmal8de3"  lay-reqText="请填写调整后单价" required placeholder="请填写调整后单价" autocomplete="off" class="layui-input" >'+
                                '</div>' +
                                '<div class="layui-form-mid">元/度</div>' +
                            '</div>' +
                            '<div class="layui-form-item label-l">' +
                                '<label class="layui-form-label text-w-100"><span class="c-orange">* </span>生效日期</label>' +
                                '<div class="layui-input-inline text-w-250">' +
                                    '<input type="text" name="effectiveDate" value="" lay-verify="required|date" placeholder="请填写生效日期"  lay-reqText="请填写生效日期" autocomplete="off" class="layui-input gtThanToday">'+
                                '</div>' +
                            '</div>' +
                            '<div class="layui-form-item label-l">' +
                                '<label class="layui-form-label text-w-100"></label>' +
                                '<div class="layui-input-inline" style="width: 300px;">' +
                                    '<p><span class="c-orange">说明：自生效日期起新抄电表将按调整后的电费单价计算电费（即抄表日期≥生效日期的抄表）</span></p>' +
                                '</div>' +
                            '</div>' +
                            '<!--写一个隐藏的btn -->' +
                            '<button class="submitBtn" lay-submit lay-filter="bind" style="display: none;">' +
                            '</button>' +
                        '</form>' +
                    '</div>';
        return _html;
    }

    // 更新不参与抄表特例设置房间后的url
    function updateSingleHouseUrl() {
        var url = $('.showSingleHouse').attr('data-url'),
            ammeterIdsStr = $('#ammeterIds').val(),
            path = url.split('?')[0],
            queryStr = url.split('?')[1];
        var paramArr = queryStr.split('&');
        var result = [];

        for(var i = 0; i < paramArr.length; i++) {
            var tempObj = {};
            tempObj.key = paramArr[i].split('=')[0];
            if(tempObj.key == 'roomIds') {
                tempObj.value = ammeterIdsStr;
            } else {
                tempObj.value = paramArr[i].split('=')[1];
            }
            result.push(tempObj);
        }

        var tempArr = [];
        for(var j = 0; j < result.length; j++) {
            tempArr.push(result[j].key + '=' + result[j].value);
        }

        $('.showSingleHouse').attr('data-url', path + '?' + tempArr.join('&'));
    }

    function isCheckAll() {
        var $items = $('input[name^=chargeList]'),
            $activeItems = $('input[name^=chargeList]:checked');

        if($items.length == $activeItems.length) {
            $('input[name=allChargeList]').prop('checked', true);
        } else {
            $('input[name=allChargeList]').prop('checked', false);
        }

        if($activeItems.length) {
            $('.batchsetting').removeClass('layui-btn-disabled');
        } else {
            $('.batchsetting').addClass('layui-btn-disabled');
        }

    }

    $(function() {
        init();

        /**
         * 添加电表
         */
        $(document).on('click', '.addAmmeter', function(e){
            var $o = $(this),
                url = $o.attr('data-url'),
                checkUrl = $o.attr('data-check-url'),
                redirectUrl = $o.attr('data-redirect-url'),
                selecthouseurl = $o.attr('data-select-house-url');

            Req.getReq(checkUrl, function (res) {
                if(res.status) {
                    Dialog.formDialog({
                        title: '添加电表',
                        area: ['560px', '480px'],
                        content: getMeterDialogHtml(selecthouseurl),
                        success: function (layero, index) {
                            form.render(null, 'formDialog');
                            // renderDatebox();
                            lessThanToday();

                            var $form = layero.find('form');

                            form.on('submit(bind)', function (data) {
                                var initReading = layero.find('input[name=initReading]').val(),
                                    maxReading = layero.find('select[name=maxreading] option:selected').val();

                                if(Common.Util.accSub(maxReading, initReading) > 0){
                                    Dialog.errorDialog('初始读数不能大于最大读数');
                                    return false;
                                }

                                var param = $form.serializeArray();
                                Req.postReqCommon(url, param);
                                return false;
                            });
                        }
                    })
                } else {
                    Dialog.confirmDialog({
                        title: '提示',
                        content: '该园区的电表抄表周期规则尚未设置，需先完成设置然后才可以添加电表',
                        btn: ['立即设置', '暂不设置'],
                        yesFn: function (index, layero) {
                            window.location.href = redirectUrl;
                        }
                    })
                }
            });
        });
        // 选择房间
        $(document).on('click', '#choosehouse', function () {
            var url = $(this).attr('data-url'),
                $chooseHouse = $('#choosehouse'),
                $roomId = $('#roomid');
            var layerIndex = layer.load(2, {shade: [0.1, '#000']});
            Req.getReq(url, function (html) {
                Dialog.formDialog({
                    id: '10001',
                    title: '房源选择',
                    content: html,
                    area: ['720px', 'auto'],
                    success: function (layero, index) {
                        layer.close(layerIndex);

                        if($chooseHouse.val()) {
                            form.val('selectHouseForm', {
                                roomId: $roomId.val(),
                            });
                            layero.find('.selectroom').html($chooseHouse.val());
                        }
                        form.render(null, 'selectHouseForm');

                        form.on('radio(room)', function(data) {
                            var elem = data.elem;
                            layero.find('.selectroom').html($(elem).attr('data-room-info'));
                        });
                    },
                    yesFn: function (index, layero) {
                        var $selectedRadio = layero.find('input[type=radio]:checked');
                        var roomInfo = $selectedRadio.attr('data-room-info'),
                            roomId = $selectedRadio.val();
                        $('#choosehouse').val(roomInfo);
                        $('#roomid').val(roomId);
                        layer.close(index);
                    }
                })
            }, 'html');
        });

        /**
         * 抄表周期
         */
        // 不参与抄表特例设置
        $(document).on('click', '.showSingleHouse', function() {
            var url = $(this).attr('data-url'),
                ammeterIds = $('#ammeterIds').val();
            var layerIndex = layer.load(2, {shade: [0.1, '#000']});
            Req.getReq(url, function (html) {
                Dialog.formDialog({
                    id: '10001',
                    title: '房源选择',
                    content: html,
                    area: ['720px', '660px'],
                    success: function (layero, index) {
                        layer.close(layerIndex);
                        form.render(null, 'selectHouseForm');

                        if(ammeterIds) {
                            // 编辑填充
                            var selectRoomIds = ammeterIds.split(',');
                            selectRoomIds.forEach(function(v, k) {
                                var $o = layero.find('input:checkbox[value='+ v +']');
                                $o.next().trigger('click');
                                // $o.prop('checked', true);
                            });
                            updateSelectRoomText();
                            form.render(null, 'selectHouseForm');
                        }

                        function updateSelectRoomText() {
                            var $ibsCollaContents = layero.find('.ibs-colla-content');
                            var roomNum = [], buildName = [];
                            $ibsCollaContents.each(function (i, o) {
                                var $curO = $(o),
                                    $ibsCollaTitle = $curO.prev(),
                                    key = $ibsCollaTitle.text().trim('');
                                buildName.push(key);
                                var $boxSlt = $curO.find('input[type=checkbox]:checked').not('.selectallrooms');
                                if($boxSlt.length) {
                                    roomNum[i] = [];
                                    $boxSlt.each(function (j, target) {
                                        roomNum[i].push($(target).attr('data-room-num'));
                                    });
                                }
                            });

                            var temp = [];
                            roomNum.forEach(function (arr, index) {
                                temp.push(buildName[index] + '-' + arr.join(','));
                            });

                            layero.find('.selectroom').html(temp.join(';'));
                            layero.find('.selectroom').attr('title', temp.join(';'));
                        }

                        // 单个房间
                        form.on('checkbox(room)', function(data) {
                            var $elem = $(data.elem);
                            var $curFloor = $elem.closest('.floor'),
                                $curBuild = $elem.closest('.ibs-colla-content'),
                                $curFloorRooms = $curFloor.find('input[type=checkbox]').not('.selectallrooms'),
                                $curFloorRoomsSlt = $curFloor.find('input[type=checkbox]:checked').not('.selectallrooms'),
                                $curBuildRooms = $curBuild.find('input[type=checkbox]').not('.selectallrooms,.selectRooms'),
                                $curBuildRoomsSlt = $curBuild.find('input[type=checkbox]:checked').not('.selectallrooms,.selectRooms');

                            var $curBuildBox = $curBuild.prev('.ibs-colla-title').find('.selectRooms'),
                                $curFloorBox = $curFloor.find('.selectallrooms');

                            if($curFloorRooms.length == $curFloorRoomsSlt.length) {
                                $curFloorBox.prop('checked', true);
                            } else {
                                $curFloorBox.prop('checked', false);
                            }

                            if($curBuildRooms.length == $curBuildRoomsSlt.length) {
                                $curBuildBox.prop('checked', true);
                            } else {
                                $curBuildBox.prop('checked', false);
                            }

                            form.render(null, 'selectHouseForm');
                            updateSelectRoomText();
                        });

                        // 楼层
                        form.on('checkbox(allroom)', function (data) {
                            var $elem = $(data.elem);
                            var $curFloor = $elem.closest('.floor'),
                                $curBuild = $elem.closest('.ibs-colla-content'),
                                $curFloorRooms = $curFloor.find('input[type=checkbox]').not('.selectallrooms'),
                                $curBuildRooms = $curBuild.find('input[type=checkbox]').not('.selectallrooms,.selectRooms');

                            if(data.elem.checked) {
                                $curFloorRooms.each(function (i, o) {
                                    $(o).prop('checked', true);
                                });
                            } else {
                                $curFloorRooms.each(function (i, o) {
                                    $(o).prop('checked', false);
                                });
                            }
                            var $curBuildBox = $curBuild.prev('.ibs-colla-title').find('.selectRooms');
                            var $curBuildRoomsSlt = $curBuild.find('input[type=checkbox]:checked').not('.selectallrooms,.selectRooms');

                            if($curBuildRooms.length == $curBuildRoomsSlt.length) {
                                $curBuildBox.prop('checked', true);
                            } else {
                                $curBuildBox.prop('checked', false);
                            }

                            form.render(null, 'selectHouseForm');
                            updateSelectRoomText();
                        });

                        // 楼宇
                        form.on('checkbox(build)', function (data) {
                            var $elem = $(data.elem);
                            var $curBuild = $elem.closest('.ibs-colla-title').next(),
                                $rooms = $curBuild.find('input[type=checkbox]');

                            if(data.elem.checked) {
                                $rooms.each(function(i, o) {
                                    $(o).prop('checked', true);
                                });
                            } else {
                                $rooms.each(function(i, o) {
                                    $(o).prop('checked', false);
                                });
                            }

                            form.render(null, 'selectHouseForm');
                            updateSelectRoomText();
                        });
                    },
                    yesFn: function (index, layero) {
                        var $selectedBox = layero.find('input[name="roomId[]"]:checked');
                        var result = [];
                        $selectedBox.each(function (i, o) {
                            result.push($(o).val());
                        });
                        $('#ammeterIds').val(result.join(','));
                        $('.roomCount').text(result.length);
                        updateSingleHouseUrl();
                        layer.close(index);
                    }
                })
            }, 'html');
        });

        // 不参与抄表特例设置显示、隐藏
        form.on('radio(readingType)', function (data) {

            var $parent = $(this).parent(),
                $singleHouse = $parent.find('.showSingleHouse');

            $('.showSingleHouse').hide();
            if(data.value == '0' || data.value == '1') {
                // 一月一抄\两月一抄
                $singleHouse.show();
            }
        });
        form.on('submit(ammeterSubmit)', function (data) {
            var $form = $('form'),
                elem = data.elem,
                url = $(elem).attr('data-url'),
                param = $form.serializeArray();

            Req.postReqCommon(url, param);
            return false;
        });

        // 单选
        form.on('checkbox(price)', function (data) {
            isCheckAll();
            form.render();
        });

        // 全选
        form.on('checkbox(allPrice)', function (data) {
            if(data.elem.checked) {
                $('input[name^=chargeList]').prop('checked', true);
            } else {
                $('input[name^=chargeList]').prop('checked', false);
            }
            isCheckAll();
            form.render();
        });

        // 电价标准设定
        $(document).on('click', '.addParkPrice', function() {
            var url = $(this).attr('data-url'),
                price = !$(this).attr('data-price') ? '' : $(this).attr('data-price');

            Dialog.formDialog({
                title: '电价标准设置',
                content: getStandPirceDialogHtml(price),
                area: ['480px', 'auto'],
                success: function (layero, index) {
                    var $form = layero.find('form');
                    form.on('submit(bind)', function (data) {
                        var param = $form.serializeArray();

                        Req.postReqCommon(url, param);
                        return false;
                    });
                }
            });
        });

        // 电价调整
        $(document).on('click', '.adjustPrice', function() {
            var $o = $(this),
                url = $o.attr('data-url'),
                oldPrice = $o.attr('data-old-price'),
                newPrice = $o.attr('data-new-price'),
                effectiveDate = $o.attr('data-effective-date'),
                customerName = $o.attr('data-customer-name');

            var param = {
                oldPrice: oldPrice,
                newPrice: newPrice,
                effectiveDate: effectiveDate,
                customerName: customerName,
                url: url
            };

            Dialog.formDialog({
                title: '电费调整',
                content: getAdjustPriceDialogHtml(param),
                area: ['480px', 'auto'],
                success: function (layero, index) {
                    // renderDatebox();
                    gtThanToday();
                    var $form = layero.find('form');
                    form.on('submit(bind)', function (data) {
                        var param = $form.serializeArray();

                        var curDate = Common.Util.dateFormat(new Date(new Date().getTime()), 'yyyy-MM-dd');
                        var validateDate = layero.find('input[name=validateDate]').val();
                        if(DateRangeUtil.compareDate(curDate, validateDate)) {
                            Req.postReqCommon(url, param);
                        } else {
                            Dialog.errorDialog("生效日期应大于等于今日");
                            return false;
                        }

                        return false;
                    });
                }
            });
        });

        // 电价批量调整
        $(document).on('click', '.batchsetting', function() {
            var $o = $(this),
                url = $o.attr('data-url');

            if($o.hasClass('layui-btn-disabled')) return;

            Dialog.formDialog({
                title: '批量电费调整',
                content: getBatchAdjustPriceDialogHtml(),
                area: ['480px', 'auto'],
                success: function (layero, index) {
                    gtThanToday();
                    var $form = layero.find('form');
                    form.on('submit(bind)', function (data) {
                        var afterCharge = data.field.afterCharge,
                            effectiveDate = data.field.effectiveDate;

                        var curDate = Common.Util.dateFormat(new Date(new Date().getTime()), 'yyyy-MM-dd');
                        if(DateRangeUtil.compareDate(curDate, effectiveDate)) {
                            var $activeBox = $('input[name^=chargeList]:checked');
                            var result = [];

                            $activeBox.each(function (i, o) {
                                var param = {},
                                    json = JSON.parse($(o).val());
                                param.customerId = json.customerId;
                                param.beforeCharge = json.beforeCharge;
                                param.afterCharge = afterCharge;
                                param.effectiveDate = effectiveDate;
                                result.push(param);
                            });
                            Req.postReq(url, {chargeList: result}, function (res) {
                                if(res.status) {
                                    Dialog.successDialog(res.msg, function () {
                                        ListModule.updateList(function () {
                                            $('input[name=allChargeList]').prop('checked', false);
                                            form.render();
                                        });
                                    })
                                    layer.close(index);
                                } else {
                                    Dialog.errorDialog(res.msg);
                                }
                            });
                        } else {
                            Dialog.errorDialog("生效日期应大于等于今日");
                            return false;
                        }

                        return false;
                    });
                }
            });
        });
        // 电表编辑
        $(document).on('click', '.editAmmeter', function() {
            var url = $(this).attr('data-url'),
                selectHouseUrl = $(this).attr('data-select-house-url'),
                remark = $(this).attr('data-remark'),
                meterNum = $(this).attr('data-meter-num'),
                meterType = $(this).attr('data-meter-type'),
                ratio = $(this).attr('data-ratio'),
                maxReading = $(this).attr('data-max-reading'),
                roomId = $(this).attr('data-room-id'),
                roomName = $(this).attr('data-room-name'),
                latestReading = $(this).attr('data-latest-reading'),
                initMeter = $(this).attr('data-init-meter'),
                // V3.2.6
                initRecordAt = $(this).attr('data-init-record-at'),
                lastRead = $(this).attr('data-last-read'),
                lastDt = $(this).attr('data-last-dt');

            var config = {
                url: url,
                selectHouseUrl: selectHouseUrl,
                remark: remark,
                meterNum: meterNum,
                meterType: meterType,
                ratio: ratio,
                maxReading: maxReading,
                roomId: roomId,
                roomName: roomName,
                latestReading: latestReading,
                initMeter: initMeter,
                // V3.2.6
                initRecordAt: initRecordAt,
                lastRead: lastRead,
                lastDt: lastDt
            };

            Dialog.formDialog({
                title: '编辑电表',
                area: ['560px', '480px'],
                content: getMeterEditDialogHtml(config),
                success: function (layero, index) {
                    var $form = layero.find('form');
                    form.val('formDialog', {
                        maxreading: config.maxReading,
                        virtal: config.meterType == '1' ? true : false
                    });
                    // renderDatebox();
                    lessThanToday();

                    form.render(null, 'formDialog');

                    form.on('submit(bind)', function (data) {
                        var initReading = layero.find('input[name=initReading]').val(),
                            maxReading = layero.find('select[name=maxreading] option:selected').val();

                        if(Common.Util.accSub(maxReading, initReading) > 0){
                            Dialog.errorDialog('初始读数不能大于最大读数');
                            return false;
                        }

                        // 初始抄表日期 <= 当前日期
                        if(config.initMeter == 1 || config.initMeter == 4) {
                            var initReadingDate = layero.find('input[name=initReadingDate]').val(),
                                curDate = Common.Util.dateFormat(new Date(new Date().getTime()), 'yyyy-MM-dd');

                            var diff = Common.Util.countDateDiff(curDate, initReadingDate);
                            if(diff < 0) {
                                Dialog.errorDialog('初始抄表日期不能大于当前日期【' + curDate + '】');
                                return false;
                            }
                        }
                        var param = $form.serializeArray();
                        var formSubmitData = form.val('formDialog');
                        if(formSubmitData.virtal) {
                            param.push({name: 'virtal', value: 1});
                        } else {
                            param.push({name: 'virtal', value: 0});
                        }
                        Req.postReqCommon(url, param);
                        return false;
                    });
                }
            })
        });

        // 电表删除
        $(document).on('click', '.delAmmeter', function() {
            var url = $(this).attr('data-url');
            Dialog.confirmDialog({
                title: '删除提醒',
                content: '确定要删除此电表吗？',
                yesFn: function(index, layero) {
                    Req.getReqCommon(url);
                }
            });
        });

        // 没有图片的情况
        $(document).on('click', '.showReading', function () {
            var message = $(this).attr('data-message');
            Dialog.tipDialog({
                content: message,
                yesFn: function(index, layero) {
                    layer.close(index);
                }
            });
        });

        // 停用电表
        $(document).on('click', '.stopAmmeter', function() {
            var url = $(this).attr('data-url'),
                checkUrl = $(this).attr('data-check-url'),
                meterNum = $(this).attr('data-meter-num'),
                roomName = $(this).attr('data-room-name'),
                roomId = $(this).attr('data-room-id'),
                latestDate = $(this).attr('data-latest-date'),
                latestReading = $(this).attr('data-latest-reading');

            var config = {
                url: url,
                meterNum: meterNum,
                roomId: roomId,
                roomName: roomName,
                latestDate: latestDate,
                latestReading: latestReading,
            };

            if(!!checkUrl) {
                Req.getReq(checkUrl, function (res) {
                    if(res.status) {
                        // 停用电表
                        Dialog.formDialog({
                            title: '停用电表',
                            content: getMeterStopDialogHtml(config),
                            area: ['560px', '480px'],
                            success: function (layero, index) {
                                var $form = layero.find('form');
                                var $elem = layero.find('.upload');
                                MUpload({
                                    elem: $elem,
                                    exts: 'jpg|jpeg|png',
                                    size: 2 * 1024,
                                    maxNum: 1,
                                });
                                // renderDatebox();
                                lessTodayGtLast(latestDate);
                                form.on('submit(bind)', function(data) {
                                    // 电表照片
                                    if(!layero.find('.upload-file-item').length) {
                                        Dialog.errorDialog('请上传电表照片');
                                        return false;
                                    }
                                    // 上次抄表日期≤停用日期≤当前日期
                                    var curDate = Common.Util.dateFormat(new Date(new Date().getTime()), 'yyyy-MM-dd'),
                                        stopDate = layero.find('input[name=stopDate]').val();

                                    var diff1 = Common.Util.countDateDiff(stopDate, curDate),
                                        diff2 = Common.Util.countDateDiff(stopDate, latestDate);

                                    if(diff1 > 0 || diff2 < 0) {
                                        Dialog.errorDialog('停用日期范围【' + latestDate + ' ~ ' + curDate + '】');
                                        return false;
                                    }

                                    var param = $form.serializeArray();
                                    Req.postReqCommon(url, param);
                                    return false;
                                })
                            },
                            endFn: function () {
                                // IE浏览器上传
                                if (device.ie && device.ie < 10) {
                                    $('iframe').remove();
                                }
                            }
                        })
                    } else {
                        // 停用提醒
                        Dialog.tipDialog({
                            content: res.msg,
                            yesFn: function(index, layero) {
                                layer.close(index);
                            }
                        })
                    }
                })
            }
        });

        // 电表管理-查看
        $(document).on('click', '.viewAmmeter', function() {
            var houseName = $(this).attr('data-house-name'),
                meterNum = $(this).attr('data-meter-num'),
                meterType = $(this).attr('data-meter-type'),
                preReading = $(this).attr('data-pre-reading'),
                stopReading = $(this).attr('data-stop-reading'),
                stopDate = $(this).attr('data-stop-date'),
                remark = $(this).attr('data-remark'),
                stopSrc = $(this).attr('data-stop-src');

            var meterTypeText = meterType == 1 ? '(虚拟)' : '';
            var config = {
                houseName: houseName,
                meterNum: meterNum,
                meterTypeText: meterTypeText,
                preReading: preReading,
                stopReading: stopReading,
                stopDate: stopDate,
                remark: remark,
                stopSrc: stopSrc
            }

            Dialog.confirmDialog({
                title: '查看',
                area: ['560px', '480px'],
                content: getMeterViewDialogHtml(config),
                success: function(layero, dialogIndex) {
                    layero.find('.layui-layer-btn').hide();
                }
            });
        });

        form.on('submit', function(data){
            return false;
        });

        // 导出
        $(document).on('click', '.exportData', function (e) {
            e.preventDefault();
            var url = $(this).attr('data-url'),
                key = $(this).attr('data-key');

            var param = ListModule.getSplitParam();
            param.key = key;
            if($('select[name=status]').length) {
                param.statusKey = $('select[name=status] option:selected').text() || '';
            }

            Req.postReq(url, param, function (res) {
                if(res.status) {
                    Dialog.downloadDialog({
                        downloadUrl: res.data.url
                    });
                } else {
                    Dialog.errorDialog(res.msg);
                }
            });
        });
    });
});