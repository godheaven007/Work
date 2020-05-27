/**
 * 园企互动
 */

layui.use(['element', 'form', 'Dialog', 'Req', 'Common', 'PCA', 'ATree', 'laydate', 'upload', 'MUpload', 'Editor', 'CommonEditor', 'Cropper', 'Regex'], function() {
    var $ = layui.jquery,
        form = layui.form,
        $form = $('form'),
        laydate = layui.laydate,
        ATree = layui.ATree,
        element = layui.element;
    var Common = layui.Common;
    var Dialog = layui.Dialog;
    var Pager = layui.Pager;
    var Regex = layui.Regex;
    var Req = layui.Req;
    var PCA = layui.PCA;
    var Editor = layui.Editor;
    var CommonEditor = layui.CommonEditor;
    var MUpload = layui.MUpload;
    var Cropper = layui.Cropper;
    var myCropper,
        CW = 0,       // 图片裁剪尺寸
        CH = 0;

    var parkList = [];
    var editor;

    var map, point, myGeo, lastPoi, local, circle;
    var initMap = function(mapId, longitude, latitude) {
        if ($('#settingMap').length > 0 && $('#mapResult').length == 0) {
            $('<div id="mapResult" class="map-result"></div>').insertAfter('#settingMap');
        }

        if ($('#viewMap').length > 0 && $('#mapNearby').length == 0) {
            $('<div id="mapNearby" class="map-nearby"><div class="bg"></div><div class="info"><span class="t">配套信息：</span><a href="javascript:;" class="l">写字楼</a><a href="javascript:;" class="l">餐饮</a><a href="javascript:;" class="l">交通</a><a href="javascript:;" class="l">高校</a></div></div>').insertAfter('#viewMap');
        }

        // 百度地图API功能
        // var longitude = parseFloat(($('#longitude').val() != '') ? $('#longitude').val() : 120.620194);
        // var latitude = parseFloat(($('#latitude').val() != '') ? $('#latitude').val() : 31.318049);

        longitude = !longitude ? 120.620194 : longitude;
        latitude = !latitude ? 31.318049 : latitude;

        if (mapId == 'viewMap') {
            var myIcon = new BMap.Icon("http://api.map.baidu.com/img/markers.png", new BMap.Size(23, 25), {
                offset: new BMap.Size(10, 25),
                imageOffset: new BMap.Size(0, 0 - 10 * 25)
            });
        }

        map = new BMap.Map(mapId);
        if (!longitude || !latitude) {
            point = new BMap.Point();
            lastPoi = point
            map.centerAndZoom(point, 16);
            // map.enableScrollWheelZoom();
            map.addControl(new BMap.NavigationControl());
            map.addControl(new BMap.ScaleControl());
            var marker = new BMap.Marker(point);
        } else {
            point = new BMap.Point(longitude, latitude);
            map.centerAndZoom(point, 16);
            lastPoi = point;
            var marker = new BMap.Marker(point, { icon: myIcon });
            map.addOverlay(marker);

            local = new BMap.LocalSearch(map, {
                renderOptions: { map: map, panel: "mapResult" },
                onInfoHtmlSet: function(poi) {
                    $('#longitude').val(poi.point.lng);
                    $('#latitude').val(poi.point.lat);
                    $('#pointInput').val(poi.point.lng + ',' + poi.point.lat);
                    $('#searchMapKeyword').val(poi.address);
                }
            });
            local.disableFirstResultSelection();

            if ($('.project_view').length == 0 || $('.project_view:hidden').length == 1) {
                if ($('#searchMapKeyword').val() != '') {
                    local.search($('#searchMapKeyword').val());
                }
            }
        };


        //拖动获取坐标中点
        map.addEventListener("dragend", function() {
            var cp = map.getCenter();
            $('#longitude').val(cp.lng);
            $('#latitude').val(cp.lat);
        });
        //监听点击获取经纬度
        map.addEventListener("click", function(e) {
            $('#longitude').val(e.point.lng);
            $('#latitude').val(e.point.lat);
        });
    };

    PCA();

    function getCropperHtml(_src) {
        var _html = '<div style="padding: 0 15px;">' +
            '<div style="text-align: center;">宽度：'+ CW +'px, 高度：'+ CH +'px</div>' +
            '<div class="cropper-wrapper pl-20 pr-20" style="height: 460px; overflow:hidden;">' +
            '<div class="img-container" style="height: 460px;">' +
            '<img src="'+ _src +'" id="image" style="max-width: 100%;" class="cropper-hidden">'+
            '</div>' +
            '</div>' +
            '</div>';
        return _html;
    }

    function getParamStr(obj) {
        var result = [];
        for(var key in obj) {
            result.push(key + '=' + obj[key]);
        }
        return result.join('&');
    }

    // 添加编辑预览
    function getPreviewDialogHtml(infoTitle, infoTime, infoText) {
        var _html = '<div style=" background-color:#f4f4f4; box-sizing: border-box; width: 475px; height: 600px; overflow-y: scroll; padding: 0 50px;">' +
            '<div class="layui-card-body view-news" style="background-color:#fff; min-height: 600px;">' +
            '<h2>'+ infoTitle +'</h2>' +
            '<div class="time">'+ infoTime +'</div>' +
            '<div class="txt">' +
                infoText +
            '</div>' +
            '</div>'+
            '</div>';
        return _html;
    }

    // 默认以文件图标+文件名的方式
    function getUploadItem(data, index, isShowUrl) {
        // 区分多个上传组件的fileId
        var _index = !index ? '' : index;
        var _html = '<div class="upload-file-item">' +
            '<i class="file-icon '+ data.fileType +'"></i>' +
            '<a class="upload-file-name" href="'+ data.webPath +'" target="_blank">'+ data.fileName +'</a>' +
            '<i class="upload-file-remove" data-id="'+ data.fileId +'"></i>' +
            '<input type="hidden" name="fileId'+ _index +'[]" value="'+ data.fileId +'">';
        if(isShowUrl == '1') {
            _html += '<input type="hidden" name="fileUrl'+ _index +'[]" value="'+ data.webPath +'">';
        }
        _html +=
            '</div>';
        return _html;
    }

    // 图片预览方式
    function getUploadPreviewItem2(data, index, isShowUrl) {
        // 区分多个上传组件的fileId
        var _index = !index ? '' : index;
        var _html = '<div class="upload-file-item">' +
            '<img class="pic" src="'+ data.webPath +'" width="375">' +
            '<input type="hidden" name="fileId'+ _index +'[]" value="'+ data.fileId +'">';
        _html +=
            '</div>';
        return _html;
    }

    // 图片预览方式
    function getUploadPreviewItem(data, index, isShowUrl) {
        // 区分多个上传组件的fileId
        var _index = !index ? '' : index;
        var _html = '<div class="upload-file-item file-prev">' +
            '<a href="'+ data.webPath +'" target="_blank"><img src="'+ data.webPath +'" class="file-img" width="260" height="180"></a>' +
            '<input type="hidden" name="fileId'+ _index +'[]" value="'+ data.fileId +'">';
        if(isShowUrl == '1') {
            _html += '<input type="hidden" name="fileUrl'+ _index +'[]" value="'+ data.webPath +'">';
        }
        _html +=
            '</div>';
        return _html;
    }

    function getParkListData() {
        var url = $('#selectPark').val();
        Req.getReq(url, function (res) {
            if(res.status) {
                parkList = res.data.data;
                if(parkList && parkList.length) {
                    // 去除为null的数据
                    parkList.forEach(function (item, index) {
                        if(!item) {
                            parkList.splice(index, 1);
                        }
                    })
                }
            }
        })
    }

    function renderDatebox() {
        lay('.datebox').each(function(){
            laydate.render({
                elem: this,
                trigger: 'click',
                // showBottom: false
                btns: ['clear', 'now']
            });
        });

        lay('.timebox').each(function(){
            laydate.render({
                elem: this,
                type: 'time',
                trigger: 'click',
                format: 'HH:mm'
            });
        });
    }

    function init() {
        renderDatebox();
        editor = CommonEditor.initEditor();

        if($('#settingMap').length) {
            setTimeout(function() {
                var longitude = $('#longitude').val(),
                    latitude = $('#latitude').val();
                initMap('settingMap', longitude, latitude);
            }, 500);
        }

        CW = $('.upload1').attr('data-width');
        CH = $('.upload1').attr('data-height');

        MUpload({
            elem: $('.upload1'),
            exts: 'JPG|JPEG|PNG',
            size: 1024 * 2,
            maxNum: 1,
            replace: true,
            filePolicy: 'web',
            done: function (res) {
                if(res.success) {
                    var $curUploadBtn = $('.upload1'),
                        uploadIndex = $curUploadBtn.attr('data-index'),
                        isShowUrl = $curUploadBtn.attr('data-show-url'),
                        showMode = 1,            // default:文件展示 type:1 图片预览方式
                        $uploadWrapper = $curUploadBtn.parents('.upload-wrapper'),
                        $uploadList = $uploadWrapper.find('.upload-list');

                    var tempImg = new Image();
                    tempImg.src = res.data.webPath;
                    tempImg.onload = function () {
                        var _w = tempImg.width,
                            _h = tempImg.height;

                        if(_w < CW || _h < CH) {
                            Dialog.errorDialog('图片最小尺寸为：' + CW + '*' + CH + '，当前尺寸为：' + _w + '*' + _h);
                            return false;
                        }

                        Dialog.confirmDialog({
                            title: '裁剪图片',
                            content: getCropperHtml(res.data.webPath),
                            area:['700px', '600px'],
                            btn: ['确定', '取消'],
                            success: function(layero, index) {
                                var image = document.querySelector('#image'),
                                    minCroppedWidth = parseInt(CW),
                                    minCroppedHeight = parseInt(CH),
                                    maxCroppedWidth = parseInt(CW),
                                    maxCroppedHeight = parseInt(CH);

                                myCropper = new Cropper(image, {
                                    viewMode: 2,
                                    // autoCrop: false,
                                    ready: function() {
                                        // this.cropper.crop();
                                    },

                                    crop: function (event) {
                                        var width = Math.round(event.detail.width);
                                        var height = Math.round(event.detail.height);

                                        if (width < minCroppedWidth || height < minCroppedHeight
                                            || width > maxCroppedWidth || height > maxCroppedHeight ) {
                                            myCropper.setData({
                                                width: Math.max(minCroppedWidth, Math.min(maxCroppedWidth, width)),
                                                height: Math.max(minCroppedHeight, Math.min(maxCroppedHeight, height)),
                                            });
                                        }
                                    },
                                });
                            },
                            yesFn: function(index) {
                                var cropData = myCropper.getData(true);
                                var param = {
                                    x: cropData.x,
                                    y: cropData.y,
                                    // w: cropData.width,
                                    // h: cropData.height,
                                    w: CW,
                                    h: CH,
                                    size: 1,    // 放大或缩小倍数
                                    fileId: res.data.fileId
                                };
                                var url = 'http://oms.'+ Common.getRootDomain() +'/oms/api/common/file/saveView?' + getParamStr(param);

                                Req.getReq(url, function(res) {
                                    if(res.success) {
                                        Dialog.successDialog('上传成功', function () {
                                            if(showMode == '1') {
                                                $uploadList.html(getUploadPreviewItem(res.data, uploadIndex, isShowUrl));
                                            } else {
                                                $uploadList.html(getUploadItem(res.data, uploadIndex, isShowUrl));
                                            }
                                            layer.close(index);
                                        });
                                    } else {
                                        Dialog.errorDialog(res.errorMessage);
                                    }
                                });
                            }
                        });
                    };

                } else {
                    Dialog.errorDialog(res.errorMessage);
                }
            }
        });

        getParkListData();

        // 发布时间
        var maxDate = Common.Util.dateFormat(new Date(), 'yyyy-MM-dd');
        laydate.render({
            elem: $('input[name=publish_time]')[0],
            type: 'datetime',
            format: 'yyyy-MM-dd HH:mm',
            min: '1990-12-31 23:59:59',
            max: maxDate + ' 23:59:59',
            trigger: 'click'
        });
    }

    function renderDeptHtml(apNameArr) {
        var _html = '';
        apNameArr.forEach(function (item, index) {
            _html += '<p><spa>'+ (parseInt(index) + 1) +'、</spa>'+ item +'</p>';
        })
        $('.parkDiv').html(_html);
    }

    function doSubmit(cb) {
        // 创建地理编码实例
        var myGeo = new BMap.Geocoder();
        var point = $('#pointInput').val().split(',');
        // 根据坐标得到地址描述
        myGeo.getLocation(new BMap.Point(point[0], point[1]), function(result){
            if (result){
                var city = result.addressComponents.city;
                var compareCity = '';
                var zxs = ['北京市', '重庆市', '天津市', '上海市'];     // 取省市区组件的province框的值

                if($.inArray(city, zxs) != -1) {
                    compareCity = $('select[name=province] option:selected').text();
                } else {
                    compareCity = $('select[name=city] option:selected').text();
                }

                if(city != compareCity) {
                    Dialog.errorDialog('当前活动地址所属的城市与坐标设置定位的城市不一致');
                    return false;
                }
                cb && cb();
            }
        });
    }

    $(function() {
        init();

        /**
         * 地图
         */
        //回车搜索
        $(document).on('keydown', '#searchMapKeyword', function(e) {
            if (event.keyCode == 13) {
                if ($('#searchMapKeyword').is(':focus')) {
                    $('#localsearch').trigger('click');
                }
            }
        });

        $(document).on('click', '#localsearch', function() {
            // local.search($('#searchMapKeyword').val());
            local.search($('#searchMapKeyword').val());
        });

        // 发布
        form.on('submit(doSubmit)', function (data) {
            var elem = data.elem,
                url = $(elem).attr('data-url');
            var $form = $('form');
            var param = $form.serializeArray();
            var $activeActForm = $('input[name=actForm]:checked');

            // 线下活动
            if($('#longitude').length && $activeActForm.val() == '1') {
                if(!$('#longitude').val()) {
                    Dialog.errorDialog("活动地址还未定位到地图坐标，请重新定位！");
                    return false;
                }
            }

            if(!$('.upload-list .upload-file-item').length) {
                Dialog.errorDialog('请上传活动海报');
                return false;
            }

            // 验证编辑器内容
            var html = editor.$txt.html();
            html = html.replace(/<p><br><\/p>/g, '');
            if(html == '') {
                Dialog.errorDialog('正文不能为空');
                return false;
            }

            var $parkIds = $('input[name=parkIds]');
            if(!$parkIds.val() || ($parkIds.val() == '[]')) {
                Dialog.errorDialog('请选择发布园区');
                return false;
            }


            /**
             * 活动时间验证
             */

            if($('input[name=begindate]').length) {
                var beginDate = $('input[name=begindate]').val(),
                    beginTime = $('input[name=begintime]').val();
                var endDate = $('input[name=enddate]').val(),
                    endTime = $('input[name=endtime]').val();
                var deadlinedate = $('input[name=deadlinedate]').val(),
                    deadlinetime = $('input[name=deadlinetime]').val();

                // 报名时间验证
                var date1 = new Date(beginDate + ' ' + beginTime),
                    date2 = new Date(endDate + ' ' + endTime),
                    date3 = new Date(deadlinedate + ' ' + deadlinetime);

                if(date1.getTime() >= date2.getTime()) {
                    Dialog.errorDialog("活动结束时间必须晚于活动开始时间");
                    return false;
                }

                // 报名截止验证
                if(date1.getTime() <= date3.getTime()) {
                    Dialog.errorDialog("报名截止时间必须早于活动开始时间");
                    return false;
                }
            }

            if($('.updown').hasClass('hidden')) {
                param.push({name:'content', value: CommonEditor.filterInvalidBrTag()});

                Req.postReqCommon(url, param);
            } else {
                doSubmit(function () {
                    // param.push({name:'content', value: editor.$txt.html()});
                    param.push({name:'content', value: CommonEditor.filterInvalidBrTag()});

                    Req.postReqCommon(url, param);
                });
            }

            return false;
        });

        // 选择园区
        $(document).on('click', '.selectPark', function () {
            var $parkIds = $('input[name=parkIds]'),
                $parkDiv = $('.parkDiv');

            if(parkList && parkList.length) {
                if(!$parkIds.val()) {
                    // 未添加过
                    ATree({
                        data: parkList,
                        callback: function(instance) {
                            $parkDiv.html(renderDeptHtml(instance.apNameArr));
                            $parkIds.val(instance.parkIdArr.join(','));
                            instance.removeEventListener();
                            instance.$tree.remove();
                        },
                    });
                } else  {
                    // 已添加过且再次添加，需要回填值
                    ATree({
                        data: parkList,
                        callback: function(instance) {
                            $parkDiv.html(renderDeptHtml(instance.apNameArr));
                            $parkIds.val(instance.parkIdArr.join(','));
                            instance.removeEventListener();
                            instance.$tree.remove();
                        },
                        edit: $parkIds.val().split(',')
                    });
                }
            }
        });


        // 线下、线上活动
        form.on('radio(actForm)', function (data) {
            if(data.value == 2) {
                $('.updown').addClass('hidden');
            } else {
                $('.updown').removeClass('hidden');
            }
        });

        // 报名人数
        form.on('radio(actLimit)', function (data) {
            if(data.value == 1) {
                // 限制
                $('.actLimitNum').removeClass('hidden');
            } else {
                // 不限
                $('.actLimitNum').addClass('hidden');
                $('input[name=actLimitNum]').val('');
            }
        });

        // 活动费用
        form.on('radio(actFeeMode)', function (data) {
            if(data.value == 1) {
                // 收费
                $('.actFee').removeClass('hidden');
            } else {
                // 免费
                $('.actFee').addClass('hidden');
                $('input[name=actFee]').val('');
            }
        });

        form.verify({
            // 省市区、具体位置
            province: function(value, item) {
                if($(item).parent().is(":visible")) {
                    if(!/[\S]+/.test(value)) {
                        return '必填项不能为空';
                    }
                }
            },
            city: function(value, item) {
                if($(item).parent().is(":visible")) {
                    if(!/[\S]+/.test(value)) {
                        return '必填项不能为空';
                    }
                }
            },
            area: function(value, item) {
                if($(item).parent().is(":visible")) {
                    if(!/[\S]+/.test(value)) {
                        return '必填项不能为空';
                    }
                }
            },
            address: function(value, item) {
                if($(item).is(":visible")) {
                    if(!/[\S]+/.test(value)) {
                        return '必填项不能为空';
                    }
                }
            },
            actLimitNum: function(value, item) {
                if($(item).is(":visible")) {
                    if(!/[\S]+/.test(value)) {
                        return '必填项不能为空';
                    }
                    if(!Regex.onlyOneInteger.reg.test(value)) {
                        return Regex.onlyOneInteger.msg;
                    }
                }
            },
            actFee: function (value, item) {
                if($(item).is(":visible")) {
                    if(!/[\S]+/.test(value)) {
                        return '必填项不能为空';
                    }
                    if(!Regex.onlyDecmal9Ex0.reg.test(value)) {
                        return Regex.onlyDecmal9Ex0.msg;
                    }
                }
            }
        });
    });
});