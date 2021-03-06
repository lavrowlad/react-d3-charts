var D3TimeLineChart=React.createClass({

    propTypes: {
        width:React.PropTypes.number,
        height:React.PropTypes.number,
        id:React.PropTypes.string,
        interpolations:React.PropTypes.string,
        data:React.PropTypes.array.isRequired,
        xData:React.PropTypes.string.isRequired,
        yData:React.PropTypes.string.isRequired,
        margin:React.PropTypes.object,
        yMaxBuffer:React.PropTypes.number,
        fill:React.PropTypes.string
    },

    mixins:[resizeMixin],

    getDefaultProps: function() {
        return {
            width: 800,
            height: 300,
            id: 'v1_chart',
            interpolations:'linear',
            margin:{
                top: 5, right: 5, bottom: 5, left: 5
            },
            yMaxBuffer:10
        };
    },
    getInitialState:function(){
        return {
            tooltip:{ display:false,data:{key:'',value:''}},
            width:500
        };
    },

    createChart:function(_self){

        this.w = this.state.width - (this.props.margin.left + this.props.margin.right);
        this.h = this.props.height - (this.props.margin.top + this.props.margin.bottom);

        this.xScale = d3.time.scale()
            .domain(d3.extent(this.props.data, function (d) {
                return d[_self.props.xData];
            }))
            .rangeRound([0, this.w]);

        this.yScale = d3.scale.linear()
            .domain([0,d3.max(this.props.data,function(d){
                return d[_self.props.yData]+_self.props.yMaxBuffer;
            })])
            .range([this.h, 0]);

        this.area = d3.svg.area()
            .x(function (d) {
                return this.xScale(d[_self.props.xData]);
            })
            .y0(this.h)
            .y1(function (d) {
                return this.yScale(d[_self.props.yData]);
            }).interpolate(this.props.interpolations);


        var interpolations = [
            "linear",
            "step-before",
            "step-after",
            "basis",
            "basis-closed",
            "cardinal",
            "cardinal-closed"];

        this.line = d3.svg.line()
            .x(function (d) {
                return this.xScale(d[_self.props.xData]);
            })
            .y(function (d) {
                return this.yScale(d[_self.props.yData]);
            }).interpolate(this.props.interpolations);


        this.transform='translate(' + this.props.margin.left + ',' + this.props.margin.top + ')';
    },

    createElements:function(element,i){
        var object;
        switch(element.type){
            case 'dots':
                object=(<D3Dots x={this.xScale} y={this.yScale} showToolTip={this.showToolTip} hideToolTip={this.hideToolTip}
                    {...this.props} {...element.props} key={i}/>);
                break;

            case 'tooltip':
                object=<D3ToolTip tooltip={this.state.tooltip} key={i} {...this.props} {...element.props}/>;
                break;

            case 'xGrid':
                object=<D3Grid h={this.h} len={this.h} scale={this.xScale} gridType="x" key={i} {...this.props} {...element.props}/>;
                break;

            case 'yGrid':
                object=<D3Grid h={this.h} len={this.w} scale={this.yScale} gridType="y" key={i} {...this.props} {...element.props}/>;
                break;

            case 'xAxis':
                object=<D3Axis h={this.h} scale={this.xScale} axisType="x" key={i} {...this.props} {...element.props}/>;
                break;

            case 'yAxis':
                object=<D3Axis h={this.h} scale={this.yScale} axisType="y" key={i} {...this.props} {...element.props}/>;
                break;

            case 'area':
                object=<path className={element.props.className} d={this.area(this.props.data)} key={i} fill={element.props.fill}/>;
                break;
            case 'path':
                object=<path className={element.props.className} d={this.line(this.props.data)} strokeLinecap={element.props.strokeLinecap} key={i}/>;
                break;

        }
        return object;
    },
    createDefs:function(element,i){
        var object;
        switch(element.type){
            case 'gradient':
                object=(<D3Gradient id={element.props.id} color1={element.props.color1} color2={element.props.color2}/>);
                break;
        }
        return object;
    },
    render:function(){
        this.createChart(this);

        var elements;
        var defs;
        var _self=this;

        if(this.props.children!=null) {
            if (Array.isArray(this.props.children)) {
                elements=this.props.children.map(function(element,i){

                    if(element.type!="defs")
                        return _self.createElements(element,i)
                });

                for(var i=0;i<this.props.children.length;++i){
                    if(this.props.children[i].type=="defs"){

                        var config=this.props.children[i].props.children;
                        if(config!=null){
                            if(Array.isArray(config)){
                                defs=config.map(function(elem,i){
                                    return this.createDefs(elem,i)
                                });
                            }else{
                                defs=this.createDefs(config,0);
                            }
                        }

                    }
                }



            }else{
                elements=this.createElements(this.props.children,0)
            }
        }

        return (
            <div>
                <svg id={this.props.id} width={this.state.width} height={this.props.height}>
                    {defs}
                    <g transform={this.transform}>
                        {elements}

                    </g>

                </svg>


            </div>
        );
    },
    showToolTip:function(e){
        e.target.setAttribute('fill', '#FFFFFF');

        this.setState({tooltip:{
            display:true,
            data: {
                key:e.target.getAttribute('data-key'),
                value:e.target.getAttribute('data-value')
                },
            pos:{
                x:e.target.getAttribute('cx'),
                y:e.target.getAttribute('cy')
            }

            }
        });
    },
    hideToolTip:function(e){
        e.target.setAttribute('fill', '#7dc7f4');
        this.setState({tooltip:{ display:false,data:{key:'',value:''}}});
    }


});

window.D3TimeLineChart=D3TimeLineChart;