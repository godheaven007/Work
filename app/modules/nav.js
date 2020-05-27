/**
 * 目录导航（招商看板）
 */
layui.define(function(exports){
    var $ = layui.jquery;

    function Nav(config){
        this.opts = $.extend(true, {
            scrollThreshold: 0.5,    // 滚动检测阀值 0.5在浏览器窗口中间部位
            scrollSpeed: 700,        // 滚动到指定位置的动画时间
            scrollTopDistance: 240,
            easing: 'swing',
            delayDetection: 100,     // 延时检测，避免滚动的时候检测过于频繁
            noticeH: 40,             // 通知条高度
            noticeShow: false,
            scrollChange:function(){}
        }, config);

        this.$scrollWin = config.scrollArea;// 滚动窗口
        this.$scrollBoxes = config.scrollBoxes;
        this.$pageNavBar = config.pageNavBar;
        this.offsetArr = [];
        this.init();
    }

    Nav.prototype = {
        init:function(){
            if($('.notice').length) {
                var _top =  $('.tab-fixed').css('top');
                $('.tab-fixed').css('top', parseInt(_top) + this.opts.noticeH);
                this.opts.noticeShow = true;
            }
            this.setArr();
            this.bindEvent();
        },

        setArr:function(){
            var _this = this;
            this.$scrollBoxes.each(function(){
                var $o = $(this),
                    offsetTop = Math.round($o.offset().top);
                _this.offsetArr.push(offsetTop);
            });
        },

        ifPos:function(st){
            var offsetArr = this.offsetArr,
                windowHeight = Math.round(this.$scrollWin.height() * this.opts.scrollThreshold);

            for(var i = 0; i < offsetArr.length; i++){
                if((offsetArr[i] - windowHeight) < st) {
                    var $curIndexNavBar = this.$pageNavBar.eq(0),
                        $CurFixedNavBar = this.$pageNavBar.eq(1);
                    var $curIndexLi = $curIndexNavBar.children('li').eq(i);
                    var $curFixedLi = $CurFixedNavBar.children('li').eq(i);

                    $curIndexLi.addClass('layui-this').siblings("li").removeClass("layui-this");
                    $curFixedLi.addClass('layui-this').siblings("li").removeClass("layui-this");
                    this.opts.scrollChange.call(this);
                }
            }
        },

        bindEvent:function(){
            var _this = this,
                timer = 0;
            this.$scrollWin.on("scroll",function(){
                var $this = $(this);

                clearTimeout(timer);
                timer = setTimeout(function(){
                    if($this.scrollTop() > _this.opts.scrollTopDistance) {
                        $('.tab-index').attr('visibility', 'hidden');
                        $('.tab-fixed').removeClass('hidden');
                        _this.ifPos($this.scrollTop());
                    } else {
                        $('.tab-fixed').addClass('hidden');
                        $('.tab-index').attr('visibility', 'visible');
                    }
                }, _this.opts.delayDetection);
            });

            this.$pageNavBar.on("click","li",function(){
                var $this = $(this),
                    index = $this.index();
                var $parent = $this.parent();

                if($parent.hasClass('tab-index')) {
                    _this.opts.delayDetection = 0;
                } else {
                    _this.opts.delayDetection = 100;
                }

                _this.scrollTo(_this.offsetArr[index] - 110, function () {

                });
            })
        },

        scrollTo: function(offset, cb) {
            var _this = this;
            this.$scrollWin.animate(
                {
                    scrollTop: offset
                },
                this.opts.scrollSpeed,
                this.opts.easing,
                function () {
                    cb && cb();
                }
            );
        }
    };

    function getNavInstance(option) {
        return new Nav(option);
    }

    // 注意，这里是模块输出的核心，模块名必须和use时的模块名一致
    exports('Nav', getNavInstance);
});