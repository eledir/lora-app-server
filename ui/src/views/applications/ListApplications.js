import React, { Component } from 'react';
import { Link } from 'react-router';

import Pagination from "../../components/Pagination";
import ApplicationStore from "../../stores/ApplicationStore";
import SessionStore from "../../stores/SessionStore";
import OrganizationStore from "../../stores/OrganizationStore";

class ApplicationRow extends Component {
  render() {
    return(
      <tr>
        <td>{this.props.application.id}</td>
        <td><Link to={`/organizations/${this.props.application.organizationID}/applications/${this.props.application.id}`}>{this.props.application.name}</Link></td>
        <td>{this.props.application.description}</td>
      </tr>
    );
  }
}

class ListApplications extends Component {
  constructor() {
    super();

    this.state = {
      pageSize: 20,
      applications: [],
      organization: {},
      isAdmin: false,
      pageNumber: 1,
      pages: 1,
    };

    this.updatePage = this.updatePage.bind(this);
  }

  componentDidMount() {
    this.updatePage(this.props);

    SessionStore.on("change", () => {
      this.setState({
        isAdmin: SessionStore.isAdmin() || SessionStore.isOrganizationAdmin(this.props.params.organizationID), 
      });
    });
  }

  componentWillReceiveProps(nextProps) {

    this.updatePage(nextProps);
  }

  updatePage(props) {
    this.setState({
      isAdmin: SessionStore.isAdmin() || SessionStore.isOrganizationAdmin(props.params.organizationID),
    });

    OrganizationStore.getOrganization(props.params.organizationID, (org) => {
      this.setState({
        organization: org,
      });
    });

    const page = (props.location.query.page === undefined) ? 1 : props.location.query.page;

    ApplicationStore.getAllForOrganization(props.params.organizationID, this.state.pageSize, (page-1) * this.state.pageSize, (totalCount, applications) => {
      this.setState({
        applications: applications,
        pageNumber: page,
        pages: Math.ceil(totalCount / this.state.pageSize),
      });
      window.scrollTo(0, 0);
    });
  }

  render () {
    const ApplicationRows = this.state.applications.map((application, i) => <ApplicationRow key={application.id} application={application} />);

    return(
      <div className="panel panel-default">
        <div className={`panel-heading clearfix ${this.state.isAdmin ? '' : 'hidden'}`}>
          <div className="btn-group pull-right">
            <Link to={`/organizations/${this.props.params.organizationID}/applications/create`}><button type="button" className="btn btn-default btn-sm">Create application</button></Link>
          </div>
        </div>
        <div className="panel-body">
          <table className="table table-hover">
            <thead>
              <tr>
                <th className="col-md-1">ID</th>
                <th className="col-md-4">Name</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {ApplicationRows}
            </tbody>
          </table>
        </div>
        <Pagination pages={this.state.pages} currentPage={this.state.pageNumber} pathname={`/organizations/${this.props.params.organizationID}`} />
      </div>
    );
  }
}

export default ListApplications;
