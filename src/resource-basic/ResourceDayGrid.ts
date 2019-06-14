import * as $ from 'jquery'
import { DayGrid } from 'fullcalendar'
import { default as ResourceDayTableMixin, ResourceDayTableInterface } from '../component/ResourceDayTableMixin'
import ResourceComponentFootprint from '../models/ResourceComponentFootprint'


export default class ResourceDayGrid extends DayGrid {

  datesAboveResources: ResourceDayTableInterface['datesAboveResources']
  registerResources: ResourceDayTableInterface['registerResources']
  processHeadResourceEls: ResourceDayTableInterface['processHeadResourceEls']
  getColResource: ResourceDayTableInterface['getColResource']
  resourceCnt: ResourceDayTableInterface['resourceCnt']
  indicesToCol: ResourceDayTableInterface['indicesToCol']
  flattenedResources: ResourceDayTableInterface['flattenedResources']

  isResourceFootprintsEnabled: boolean


  constructor(view) {
    super(view)
    this.isResourceFootprintsEnabled = true
  }


  renderDates(dateProfile) {
    this.dateProfile = dateProfile
  }


  renderResources(resources) {
    this.registerResources(resources)
    this.renderGrid()

    if (this.headContainerEl) {
      this.processHeadResourceEls(this.headContainerEl)
    }
  }


  // TODO: make DRY with ResourceTimeGrid
  getHitFootprint(hit) {
    const plainFootprint = super.getHitFootprint(hit)

    return new ResourceComponentFootprint(
      plainFootprint.unzonedRange,
      plainFootprint.isAllDay,
      this.getColResource(hit.col).id
    )
  }


  componentFootprintToSegs(componentFootprint) {
    const { resourceCnt } = this
    let genericSegs;
    // no assigned resources
    if (!componentFootprint.isAllDay) {

      genericSegs = this.datesAboveResources ?
          this.sliceRangeByDay(componentFootprint.unzonedRange) : // each day-per-resource will need its own column
          this.sliceRangeByRow(componentFootprint.unzonedRange)
    }
    else {
      if (componentFootprint.isAllDay === 'fullday') {
        genericSegs = [];
        genericSegs.push({
          firstRowDayIndex: 0,
          isEnd: true,
          isStart: true,
          lastRowDayIndex: 0,
          row: 1
        });
        genericSegs.push({
          firstRowDayIndex: 0,
          isEnd: true,
          isStart: true,
          lastRowDayIndex: 0,
          row: 0
        });
      }
      else {
        if(componentFootprint.allday_params){
          genericSegs = this.datesAboveResources ?
              this.sliceRangeByDay(componentFootprint.unzonedRange) : // each day-per-resource will need its own column
              this.sliceRangeByRow(componentFootprint.unzonedRange);
          genericSegs[0]['row'] = componentFootprint.allday_params.hit.row
        }else{

          genericSegs = this.datesAboveResources ?
              this.sliceRangeByDay(componentFootprint.unzonedRange) : // each day-per-resource will need its own column
              this.sliceRangeByRow(componentFootprint.unzonedRange);
        }

      }
    }
    if(componentFootprint.isAllDay === 'pm'){
      genericSegs[0].row = 1;
    }else if(componentFootprint.isAllDay === 'am'){
      genericSegs[0].row = 0;
    }
    const resourceSegs = []

    for (let seg of genericSegs) {

      for (let resourceIndex = 0; resourceIndex < resourceCnt; resourceIndex++) {
        const resourceObj = this.flattenedResources[resourceIndex]

        if (
          !(componentFootprint instanceof ResourceComponentFootprint) ||
          (componentFootprint.resourceId === resourceObj.id)
        ) {
          const copy = $.extend({}, seg)
          copy.resource = resourceObj

          if (this.isRTL) {
            copy.leftCol = this.indicesToCol(resourceIndex, seg.lastRowDayIndex)
            copy.rightCol = this.indicesToCol(resourceIndex, seg.firstRowDayIndex)
          } else {
            copy.leftCol = this.indicesToCol(resourceIndex, seg.firstRowDayIndex)
            copy.rightCol = this.indicesToCol(resourceIndex, seg.lastRowDayIndex)
          }

          resourceSegs.push(copy)
        }
      }
    }

    return resourceSegs
  }
}

ResourceDayTableMixin.mixInto(ResourceDayGrid)
