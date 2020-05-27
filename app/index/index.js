/**
 *
 */
layui.use(['element', 'form', 'Dialog', 'Req', 'Common', 'laydate', 'upload', 'MUpload'], function() {
    var $ = layui.jquery,
        form = layui.form,
        laydate = layui.laydate,
        device = layui.device(),
        element = layui.element;
    var Common = layui.Common;
    var Req = layui.Req;
    var Dialog = layui.Dialog;
    var MUpload = layui.MUpload;


    function getChangeParkDialogHtml(parkList, totalNum, totalPark) {
        var changeParkHtml = '<option value="">请选择</option>';

        if(parkList && parkList.length) {
            parkList.forEach(function (item, index) {
                changeParkHtml += '<option value="'+ item.parkId +'">'+ decodeURI(item.parkName) +'('+ item.num +')</option>';
            });
        }

        var _html = '<div class="layui-card-body">' +
                        '<form class="layui-form" action="" lay-filter="formDialog">' +
                            '<div class="layui-form-item">' +
                                '共'+ totalNum +'条数据，分布在'+ totalPark +'个园区，请选择要进入的园区' +
                            '</div>' +
                            '<div class="layui-form-item">' +
                                '<select name="changePark" lay-filter="changePark" lay-search>' +
                                    changeParkHtml +
                                '</select>' +
                            '</div>' +
                            '<!--写一个隐藏的btn -->' +
                            '<button class="submitBtn" lay-submit lay-filter="bind" style="display: none;">' +
                            '</button>' +
                        '</form>' +
                     '</div>';
        return _html;
    }

    function lessThanToday() {
        var curDate = Common.Util.dateFormat(new Date(new Date().getTime()), 'yyyy-MM-dd');
        lay('.lessThanToday').each(function(){
            laydate.render({
                elem: this,
                max: curDate,
                trigger: 'click',
                btns: ['clear', 'now']
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
                trigger: 'click',
                btns: ['clear', 'now']
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
                '<input type="text" name="roomnum" value="'+ config.roomName +'" id="choosehouse" readonly data-url="'+ config.selectHouseUrl +'" lay-verify="required" lay-reqText="请添加房间号" required placeholder="请添加房间号" autocomplete="off" class="layui-input" >' +
                '<input type="hidden" name="roomid" value="'+ config.roomId +'" id="roomid" />' +
                '</div>';
        }
        _html +=            '</div>' +
            '<div class="layui-form-item label-l">' +
            '<label class="layui-form-label text-w-100"><span class="c-orange">* </span>电表编号</label>' +
            '<div class="layui-input-inline text-w-250">' +
            '<input type="text" name="ammeternum" value="'+ config.meterNum +'" maxlength="15" lay-verify="required" lay-reqText="请填写电表编号" required placeholder="请填写电表编号" autocomplete="off" class="layui-input" >'+
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
                '<input type="text" name="initReading" value="'+ config.latestReading +'" lay-verify="required|onlyDecmal14" lay-reqText="请填写初始读数" required placeholder="请填写初始读数" autocomplete="off" class="layui-input" >'+
                '</div>' +
                '</div>' +
                '<div class="layui-form-item label-l">' +
                '<label class="layui-form-label text-w-100"><span class="c-orange">* </span>初始抄表日期</label>' +
                '<div class="layui-input-inline text-w-250">' +
                '<input type="text" name="initReadingDate" value="'+ config.initRecordAt +'" lay-verify="required|date" placeholder="请填写初始抄表日期" lay-reqText="请填写初始抄表日期" autocomplete="off" class="layui-input lessThanToday">'+
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
                '<input type="text" name="anewReading" lay-verify="required|onlyDecmal14" lay-reqText="请填写重新挂靠抄表读数" required placeholder="请填写重新挂靠抄表读数" autocomplete="off" class="layui-input" >'+
                '</div>' +
                '</div>' +
                '<div class="layui-form-item label-l">' +
                '<label class="layui-form-label text-w-100"><span class="c-orange">* </span>重新挂靠抄表日期</label>' +
                '<div class="layui-input-inline text-w-250">' +
                '<input type="text" name="anewReadingDate" lay-verify="required|date" placeholder="请填写重新挂靠抄表日期" lay-reqText="请填写重新挂靠抄表日期" autocomplete="off" class="layui-input lessThanToday">'+
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
            '<input type="text" name="mulrate" value="'+ config.ratio +'" lay-verify="required|onlyOneInteger" lay-reqText="请填写倍率" required placeholder="请填写倍率" autocomplete="off" class="layui-input" >'+
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
            '<input type="text" name="stopReading" lay-verify="required|onlyDecmal14" lay-reqText="请填写停用时读数" required placeholder="请填写停用时读数" autocomplete="off" class="layui-input">'+
            '</div>' +
            '</div>'+
            '<div class="layui-form-item label-l">' +
            '<label class="layui-form-label text-w-100"><span class="c-orange">* </span>停用日期</label>' +
            '<div class="layui-input-inline text-w-250">' +
            '<input type="text" name="stopDate" lay-verify="required|date" placeholder="请填写停用日期" lay-reqText="请填写停用日期" autocomplete="off" class="layui-input lessTodayGtLast">'+
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

    function getScanFileDialogHtml(name) {
        var _html = '<div class="layui-card-body">' +
            '<form class="layui-form" action="" lay-filter="formDialog" style="height: 180px; overflow-x:hidden;">' +
            '<div class="layui-form-item">' +
            '<label class="layui-form-label">客户名称</label>' +
            '<div class="layui-form-mid">' + name + '</div>' +
            '<input type="hidden" name="customerName" value="'+ name +'">' +
            '</div>' +
            '<div class="layui-form-item">' +
            '<label class="layui-form-label">上传附件</label>' +
            '<div class="layui-input-block">' +
            '<div class="upload-wrapper">' +
            '<div class="upload-box">' +
            '<button type="button" class="layui-btn upload"><i class="layui-icon"></i>上传</button><input class="layui-upload-file" type="file" accept="" name="file">' +
            '<div class="describe">请上传盖章合同扫描件，可上传多个，仅限JPG,PNG,PDF格式</div>' +
            '</div>' +
            '<div class="upload-list"></div>' +
            '</div>' +
            '</div>' +
            '</div>'+
            '<!--写一个隐藏的btn -->' +
            '<button class="submitBtn" lay-submit lay-filter="bind" style="display: none;">' +
            '</button>' +
            '</form>' +
            '</div>';
        return _html;
    }

    var index = 0,
        domArr = [],
        urlArr = [];
    function loadItem() {
        var url = urlArr[index];
        Req.getReq(url, function (res) {
            if(res.status) {
                domArr[index].html(res.data.templateContent);
                domArr[index].find('.loading').hide();
            } else {
                // 区块不显示
                domArr[index].hide();
            }
            index += 1;
            if(index < domArr.length) {
                loadItem();
            }
        });
    }

    // 异步加载首页各模块
    function loadModules() {
        var $modules = $('.ajaxLoad');
        $modules.each(function (i, o) {
            var $o = $(o),
                url = $o.attr('data-url');

            domArr.push($o);
            urlArr.push(url);
        });
        // domArr.length = 5;
        // urlArr.length = 5;
        //
        // urlArr.forEach(function (item, index) {
        //     Req.getReq(item, function (res) {
        //         if(res.status) {
        //             domArr[index].html(res.data.templateContent);
        //             domArr[index].find('.loading').hide();
        //         } else {
        //             // 区块不显示
        //             domArr[index].hide();
        //         }
        //     })
        // })
        // domArr.length = 3;
        // urlArr.length = 3;
        loadItem();

    }

    function getBrowserDialogHtml() {
        var _html = '<div class="browser">' +
            '        <div class="title">请升级您的浏览器</div>' +
            '        <div class="txt-01">检测到您当前使用的浏览器版本过低！请升级浏览器后继续使用OPark服务<br>您可以选择使用以下浏览器：</div>' +
            '        <dl>' +
            '            <dd>' +
            '                <img src="http://ibs.o.com/assets/css/images/ico-chrome.png">' +
            '                <span>Chrome(推荐)</span>' +
            '            </dd>' +
            '            <dd>' +
            '                <img src="http://ibs.o.com/assets/css/images/ico-firefox.png">' +
            '                <span>Firefox火狐</span>' +
            '            </dd>' +
            '            <dd>' +
            '                <img src="http://ibs.o.com/assets/css/images/ico-safari.png">' +
            '                <span>Safari</span>' +
            '            </dd>' +
            '            <dd>' +
            '                <img src="http://ibs.o.com/assets/css/images/ico-ie.png">' +
            '                <span>IE9及以上</span>' +
            '            </dd>' +
            '            <dd>' +
            '                <img src="http://ibs.o.com/assets/css/images/ico-360.png">' +
            '                <span>360浏览器(极速模式)</span>' +
            '            </dd>' +
            '        </dl>' +
            '    </div>';
        return _html;
    }
    $(function() {
        var browser = Common.Util.browser();
        if(browser.mozilla || browser.safari || browser.chrome || (device.ie && device.ie > 8)) {

        } else {
            Dialog.confirmDialog2({
                title: "温馨提示",
                content: getBrowserDialogHtml(),
                area: ['1000px', 'auto'],
                btn: [],
                yesFn: function (index, layero) {
                    layer.close(index);
                }
            })
        }

        loadModules();
        // 有多个园区的待回款等
        $(document).on('click', '.changePark', function () {
            var $o = $(this),
                parkList = JSON.parse($o.attr('data-park')),
                url = $o.attr('data-url'),
                redirectUrl = $o.attr('data-redirect-url'),
                totalNum = $o.attr('data-total-data'),
                totalPark = $o.attr('data-total-park');

            Dialog.confirmDialog({
                title: '选择园区',
                content: getChangeParkDialogHtml(parkList, totalNum, totalPark),
                area: ['450px', '200px'],
                btn: [],
                success: function () {
                    form.render(null, 'formDialog');
                    form.on('select(changePark)', function (data) {
                        Req.getReq(url + '?id=' + data.value, function (res) {
                            if(res.status) {
                                window.location.href = redirectUrl;
                            } else {
                                Dialog.errorDialog(res.msg);
                            }
                        });
                    });
                }
            })
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
                        // Req.postReqCommon(url, param);
                        Req.postReq(url, param, function (res) {
                            if(res.status) {
                                Dialog.successDialog(res.msg, function () {
                                    if(res.data.total == 0) {
                                        // 异常电表提醒为0
                                        $('.errorAmmeterDiv').remove();
                                    } else {
                                        $('.errorAmmeterTotal').find('span').text(res.data.total);
                                        $('.errorAmmeterContent').html(res.data.content);
                                    }
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

        // 停用电表
        $(document).on('click', '.stopAmmeter', function() {
            var url = $(this).attr('data-url'),
                checkUrl = $(this).attr('data-check-url'),
                meterNum = $(this).attr('data-meter-num'),
                roomName = $(this).attr('data-room-name'),
                roomId = $(this).attr('data-room-id'),
                latestDate = $(this).attr('data-latest-date'),
                latestReading = $(this).attr('data-latest-reading');

            var $errorAmmeterDiv = $('.errorAmmeterDiv'),
                ajaxLoadUrl = $errorAmmeterDiv.attr('data-url');

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
                                MUpload({
                                    elem: $('.upload'),
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
                                    // Req.postReqCommon(url, param);
                                    Req.postReq(url, param, function (res) {
                                        if(res.status) {
                                            Dialog.successDialog(res.msg, function () {
                                               if(res.data.total == 0) {
                                                   // 异常电表提醒为0
                                                   $('.errorAmmeterDiv').remove();
                                               } else {
                                                   $('.errorAmmeterTotal').find('span').text(res.data.total);
                                                   $('.errorAmmeterContent').html(res.data.content);
                                               }
                                               layer.close(index);
                                            });
                                        } else {
                                            Dialog.errorDialog(res.msg);
                                        }
                                    });
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
                    area: ['auto', 'auto'],
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

        // 合同待盖章
        $(document).on('click', '.ajaxUploadFile', function () {
            var $o = $(this),
                url = $o.attr('data-url'),
                name = $o.attr('data-name');
            Dialog.formDialog({
                title: '扫描上传',
                content: getScanFileDialogHtml(name),
                area: ['550px', '300px'],
                success: function (layero, dialogIndex) {
                    var $form = layero.find('form');
                    MUpload({
                        elem: $('.upload'),
                        exts: 'jpg|jpeg|png|pdf',
                        before: function() {return true},
                    });
                    form.on('submit(bind)', function(data) {
                        var param = $form.serializeArray();
                        Req.postReq(url, param, function (res) {
                            if(res.status) {
                                Dialog.successDialog(res.msg, function() {
                                    layer.close(dialogIndex);
                                    window.location.reload();
                                });
                            } else {
                                Dialog.errorDialog(res.msg);
                            }
                        });
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
        });

        $(document).on('click', '.normalDialog', function() {
            var message = $(this).attr('data-message');
            Dialog.tipDialog({
                content: message,
                yesFn: function(index, layero) {
                    layer.close(index);
                }
            })
        });
    });
});