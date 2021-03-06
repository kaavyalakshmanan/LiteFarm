import React, { Component } from "react";
import { connect } from 'react-redux';
import PageTitle from '../../../components/PageTitle';
import {logSelector, currentLogSelector} from '../selectors';
import {fieldSelector, cropSelector} from '../../selector';
import DateContainer from '../../../components/Inputs/DateContainer';
import {actions, Form} from 'react-redux-form';
import DefaultLogForm from '../../../components/Forms/Log';
import LogFooter from '../../../components/LogFooter';
import moment from 'moment';
import styles from '../styles.scss';
import parseFields from "../Utility/parseFields";
import {deleteLog, editLog} from "../Utility/actions";
import parseCrops from "../Utility/parseCrops";
import ConfirmModal from "../../../components/Modals/Confirm";

class FieldWorkLog extends Component{
  constructor(props) {
    super(props);
    this.props.dispatch(actions.reset('logReducer.forms.fieldWorkLog'));

    this.state = {
      date: moment(),
    };
    this.setDate = this.setDate.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    const { selectedLog, dispatch } = this.props;
    this.setState({
      date: selectedLog && moment.utc(selectedLog.date)
    });
    const selectedType = { value: selectedLog.fieldWorkLog.type, label: selectedLog.fieldWorkLog.type };
    dispatch(actions.change('logReducer.forms.fieldWorkLog.type', selectedType));
    dispatch(actions.change('logReducer.forms.fieldWorkLog.notes', selectedLog.notes));
  }

  setDate(date){
    this.setState({
      date: date,
    });
  }

  handleSubmit(log) {
    const { dispatch, selectedLog, fields } = this.props;
    let selectedFields = parseFields(log, fields);
    let selectedCrops = parseCrops(log);
    let formValue = {
      activity_id: selectedLog.activity_id,
      activity_kind: 'fieldWork',
      date: this.state.date,
      crops: selectedCrops,
      fields: selectedFields,
      type: log.type.value,
      notes: log.notes || '',
      user_id: localStorage.getItem('user_id'),
    };
    dispatch(editLog(formValue));
  }

  render(){
    const { crops, fields, selectedLog } = this.props;
    const selectedFields = selectedLog.field.map((f) => ({ value: f.field_id, label: f.field_name }));
    const selectedCrops = selectedLog.fieldCrop.map((fc) => ({ value: fc.field_crop_id, label: fc.crop.crop_common_name, field_id: fc.field_id }));

    return(
      <div className="page-container">
        <PageTitle backUrl="/log" title="Edit Field Work Log"/>
        <DateContainer date={this.state.date} onDateChange={this.setDate} placeholder="Choose a date"/>
        <Form model="logReducer.forms" className={styles.formContainer} onSubmit={(val) => this.handleSubmit(val.fieldWorkLog)}>
          <DefaultLogForm
            selectedCrops={selectedCrops}
            selectedFields={selectedFields}
            parent='logReducer.forms'
            model=".fieldWorkLog"
            fields={fields}
            crops={crops}
            notesField={true}
            typeField={true}
            typeOptions={['plow', 'ridgeTill', 'zoneTill', 'mulchTill', 'ripping', 'discing']}
            isCropNotNeeded={true}
          />
          <LogFooter edit={true} onClick={() => this.setState({ showModal: true })}/>
        </Form>
        <ConfirmModal
          open={this.state.showModal}
          onClose={() => this.setState({ showModal: false })}
          onConfirm={() => this.props.dispatch(deleteLog(selectedLog.activity_id))}
          message='Are you sure you want to delete this log?'
        />
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    crops: cropSelector(state),
    fields: fieldSelector(state),
    logs: logSelector(state),
    selectedLog: currentLogSelector(state),
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(FieldWorkLog);
