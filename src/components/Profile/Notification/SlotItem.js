import React from 'react';
import moment from 'moment';
import { Form } from 'react-bootstrap';
import CustomDropdown from '../../Shared/CustomDropdown/CustomDropdown';
import { DateInput } from '../../Shared/InputType';
import { NOTIFICATION_CONSTANTS } from './Constants/NotificationConstants';
import _ from 'lodash';
import GLOBAL_CONSTANTS from '../../../Constants/GlobalConstants';

const SlotItem = ({
    values, 
    setFieldValue, 
    label="", 
    slotDate="", 
    excludeDates = []
}) => {
    const TODAY = new Date();
    const TOMORROW = new Date().setDate(new Date().getDate() + 1);
    /**
     * this method trigger when select time slot
     * @param {Object} data = selected slot data
     * @param {String} slotTime = current slot time
     */
    const handleSelectTime = (data, slotTime) => {
        try {
            setFieldValue(`${slotDate}.${slotTime}.label`, data.label);
            setFieldValue(`${slotDate}.${slotTime}.from`, data.fromTime);
            setFieldValue(`${slotDate}.${slotTime}.to`, data.toTime);
        } catch (error) {
            console.error("Error occur when handleSelectTime--", error);
        }
    }

    /**
     * this method return time slot list
     * @param {String} slotTime = selected slot name
     * @returns updated time slot list
     */
    const filterTimeSlotList = (slotTime) => {
        let tmpTimeSlotList = [];
        try {
            if(values && values?.[slotDate]) {
                tmpTimeSlotList = NOTIFICATION_CONSTANTS.SLOT_LIST.map(d => 
                    (values?.[slotDate]?.[slotTime]?.from === d.fromTime) 
                    || (
                            values?.[slotDate]?.date 
                            && moment(values?.[slotDate]?.date).format("L") === moment(TODAY).format("L")
                            && d.fromTime <= new Date().getHours()
                        )
                    ? ({...d, "disabled": true}) 
                    : ({...d, "disabled": false})
                ) 
            } else {
                tmpTimeSlotList = NOTIFICATION_CONSTANTS.SLOT_LIST;
            }
        } catch (err) {
            console.error("Error occur when filterTimeSlotList--", err);
        }
        return tmpTimeSlotList;
    } 

    return <div className="pickSlot bb-ddd mb20">
        <div className="row aic jic mb20">
            <div className="col-xs-12 col-sm-2 col-md-2 theme_color f12">{label}<span className="mandatory pl5">*</span></div>
            <div className="col-xs-12 col-sm-10 col-md-10">
                <div className="row">
                    <div className="col-sm-12">
                        <DateInput 
                            name={`${slotDate}.date`} 
                            className="form-control form-control-sm" 
                            label="" 
                            minDate={new Date().getHours() >= 17 ? TOMORROW : TODAY} 
                            maxDate={new Date().setDate(new Date().getDate() + GLOBAL_CONSTANTS.DEFAULT_FUTURE_DAY_LIMIT)}
                            excludeDates={excludeDates} 
                            onChange={() => {
                                setFieldValue(`${slotDate}.slot1Time.label`, "");
                                setFieldValue(`${slotDate}.slot1Time.from`, "");
                                setFieldValue(`${slotDate}.slot1Time.to`, "");
                                setFieldValue(`${slotDate}.slot2Time.label`, "");
                                setFieldValue(`${slotDate}.slot2Time.from`, "");
                                setFieldValue(`${slotDate}.slot2Time.to`, "");
                                setFieldValue(`iconfirm`, false);
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
        <div className="row">
            <div className="col-xs-12 col-sm-2 col-md-2 theme_color f12"></div>
            <div className="col-xs-12 col-sm-10 col-md-10">
                <div className="row">
                    <div className="col-xs-12 col-sm-6 col-md-6">
                        <Form.Group>
                            <CustomDropdown {...{
                                disabled: !_.isNumber(values?.[slotDate]?.date),
                                data: filterTimeSlotList("slot2Time"),
                                bindKey: "label",
                                searchKeywords: "",
                                title: (values?.[slotDate]?.slot1Time?.label && values?.[slotDate]?.slot1Time?.label) || "- Select Slot -",
                                onSelect: (data) => handleSelectTime(data, "slot1Time")
                            }} />
                        </Form.Group>
                    </div>
                    <div className="col-xs-12 col-sm-6 col-md-6">
                        <Form.Group>
                            <CustomDropdown {...{
                                disabled: !_.isNumber(values?.[slotDate]?.date),
                                data: filterTimeSlotList("slot1Time"),
                                bindKey: "label",
                                searchKeywords: "",
                                title: (values?.[slotDate]?.slot2Time?.label && values?.[slotDate]?.slot2Time?.label) || "- Select Slot -",
                                onSelect: (data) => handleSelectTime(data, "slot2Time")
                            }} />
                        </Form.Group>
                    </div>
                </div>
            </div>
        </div>
</div>;
}
 
export default SlotItem;