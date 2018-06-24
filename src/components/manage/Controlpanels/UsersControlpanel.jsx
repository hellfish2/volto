/**
 * Users controlpanel container.
 * @module components/manage/Controlpanels/UsersControlpanel
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Link } from 'react-router';
import { Portal } from 'react-portal';
import {
  Button,
  Confirm,
  Form,
  Icon,
  Input,
  Segment,
  Table,
} from 'semantic-ui-react';
import { find, map } from 'lodash';
import {
  FormattedMessage,
  defineMessages,
  injectIntl,
  intlShape,
} from 'react-intl';

import { createUser, deleteUser, listRoles, listUsers } from '../../../actions';
import { getBaseUrl } from '../../../helpers';
import { ModalForm, Toolbar, UsersControlpanelUser } from '../../../components';

const messages = defineMessages({
  searchUsers: {
    id: 'Search users...',
    defaultMessage: 'Search users...',
  },
  save: {
    id: 'Save',
    defaultMessage: 'Save',
  },
  cancel: {
    id: 'Cancel',
    defaultMessage: 'Cancel',
  },
  back: {
    id: 'Back',
    defaultMessage: 'Back',
  },
  deleteUserConfirmTitle: {
    id: 'Delete User',
    defaultMessage: 'Delete User',
  },
  addUserButtonTitle: {
    id: 'Add User',
    defaultMessage: 'Add User',
  },
  addUserFormTitle: {
    id: 'Add User',
    defaultMessage: 'Add User',
  },
  addUserFormUsernameTitle: {
    id: 'Username',
    defaultMessage: 'Username',
  },
  addUserFormFullnameTitle: {
    id: 'Fullname',
    defaultMessage: 'Fullname',
  },
  addUserFormEmailTitle: {
    id: 'Email',
    defaultMessage: 'Email',
  },
  addUserFormPasswordTitle: {
    id: 'Password',
    defaultMessage: 'Password',
  },
  addUserFormRolesTitle: {
    id: 'Roles',
    defaultMessage: 'Roles',
  },
});

@injectIntl
@connect(
  (state, props) => ({
    roles: state.roles.roles,
    users: state.users.users,
    pathname: props.location.pathname,
    deleteRequest: state.users.delete,
    createRequest: state.users.create,
  }),
  dispatch =>
    bindActionCreators(
      { listRoles, listUsers, deleteUser, createUser },
      dispatch,
    ),
)
/**
 * UsersControlpanel class.
 * @class UsersControlpanel
 * @extends Component
 */
export default class UsersControlpanel extends Component {
  /**
   * Property types.
   * @property {Object} propTypes Property types.
   * @static
   */
  static propTypes = {
    listRoles: PropTypes.func.isRequired,
    listUsers: PropTypes.func.isRequired,
    pathname: PropTypes.string.isRequired,
    roles: PropTypes.arrayOf(
      PropTypes.shape({
        '@id': PropTypes.string,
        '@type': PropTypes.string,
        id: PropTypes.string,
      }),
    ).isRequired,
    users: PropTypes.arrayOf(
      PropTypes.shape({
        username: PropTypes.string,
        fullname: PropTypes.string,
        roles: PropTypes.arrayOf(PropTypes.string),
      }),
    ).isRequired,
    intl: intlShape.isRequired,
  };

  /**
   * Constructor
   * @method constructor
   * @param {Object} props Component properties
   * @constructs Sharing
   */
  constructor(props) {
    super(props);
    this.onChangeSearch = this.onChangeSearch.bind(this);
    this.onSearch = this.onSearch.bind(this);
    this.delete = this.delete.bind(this);
    this.onDeleteOk = this.onDeleteOk.bind(this);
    this.onDeleteCancel = this.onDeleteCancel.bind(this);
    this.onAddUserSubmit = this.onAddUserSubmit.bind(this);
    this.onAddUserError = this.onAddUserError.bind(this);
    this.onAddUserSuccess = this.onAddUserSuccess.bind(this);
    this.state = {
      search: '',
      showAddUser: false,
      showAddUserErrorConfirm: false,
      addUserError: '',
      showDelete: false,
      userToDelete: undefined,
    };
  }

  /**
   * Component did mount
   * @method componentDidMount
   * @returns {undefined}
   */
  componentDidMount() {
    this.props.listRoles();
    this.props.listUsers();
  }

  componentWillReceiveProps(nextProps) {
    if (
      (this.props.deleteRequest.loading && nextProps.deleteRequest.loaded) ||
      (this.props.createRequest.loading && nextProps.createRequest.loaded)
    ) {
      this.props.listUsers(this.state.search);
    }
    if (this.props.createRequest.loading && nextProps.createRequest.loaded) {
      this.onAddUserSuccess();
    }
    if (this.props.createRequest.loading && nextProps.createRequest.error) {
      this.onAddUserError(nextProps.createRequest.error);
    }
  }

  getUserFromProps(value) {
    return find(this.props.users, ['@id', value]);
  }

  /**
   * Search handler
   * @method onSearch
   * @param {object} event Event object.
   * @returns {undefined}
   */
  onSearch(event) {
    event.preventDefault();
    this.props.listUsers(this.state.search);
  }

  /**
   * On change search handler
   * @method onChangeSearch
   * @param {object} event Event object.
   * @returns {undefined}
   */
  onChangeSearch(event) {
    this.setState({
      search: event.target.value,
    });
  }

  /**
   * Delete a user
   * @method delete
   * @param {object} event Event object.
   * @param {string} value username.
   * @returns {undefined}
   */
  delete(event, { value }) {
    if (value) {
      this.setState({
        showDelete: true,
        userToDelete: this.getUserFromProps(value),
      });
    }
  }

  /**
   * On delete ok
   * @method onDeleteOk
   * @returns {undefined}
   */
  onDeleteOk() {
    this.props.deleteUser(this.state.userToDelete.id);
    this.setState({
      showDelete: false,
      userToDelete: undefined,
    });
  }

  /**
   * On delete cancel
   * @method onDeleteCancel
   * @returns {undefined}
   */
  onDeleteCancel() {
    this.setState({
      showDelete: false,
      itemsToDelete: [],
    });
  }

  /**
   * Callback to be called by the ModalForm when the form is submitted.
   *
   * @param {object} data Form data from the ModalForm.
   * @param {func} callback to set new form data in the ModalForm
   * @returns {undefined}
   */
  onAddUserSubmit(data, callback) {
    this.props.createUser(data);
    this.setState({
      addUserSetFormDataCallback: callback,
    });
  }

  /**
   * Handle Errors after createUser()
   *
   * @param {object} error orbject. Requires the property .message
   * @returns {undefined}
   */
  onAddUserError(error) {
    this.setState({
      addUserError: error.message,
    });
  }

  /**
   * Handle Success after createUser()
   *
   * @returns {undefined}
   */
  onAddUserSuccess() {
    this.state.addUserSetFormDataCallback({});
    this.setState({
      showAddUser: false,
      addUserError: undefined,
      addUserSetFormDataCallback: undefined,
    });
  }

  /**
   * Render method.
   * @method render
   * @returns {string} Markup for the component.
   */
  render() {
    let usernameToDelete = this.state.userToDelete
      ? this.state.userToDelete.username
      : '';
    let fullnameToDelete = this.state.userToDelete
      ? this.state.userToDelete.fullname
      : '';
    return (
      <div id="page-users">
        <Button
          content={this.props.intl.formatMessage(messages.addUserButtonTitle)}
          onClick={() => {
            this.setState({ showAddUser: true });
          }}
        />
        <Helmet title="Users and Groups" />
        <div className="container">
          <Confirm
            open={this.state.showDelete}
            header={this.props.intl.formatMessage(
              messages.deleteUserConfirmTitle,
            )}
            content={
              <div className="content">
                <ul className="content">
                  <FormattedMessage
                    id="Do you really want to delete the user {username} ({fullname})?"
                    defaultMessage="Do you really want to delete the user {username} ({fullname})?"
                    values={{
                      username: <b>{usernameToDelete}</b>,
                      fullname: <b>{fullnameToDelete}</b>,
                    }}
                  />
                </ul>
              </div>
            }
            onCancel={this.onDeleteCancel}
            onConfirm={this.onDeleteOk}
          />
          <ModalForm
            open={this.state.showAddUser}
            onSubmit={this.onAddUserSubmit}
            submitError={this.state.addUserError}
            onCancel={() => this.setState({ showAddUser: false })}
            title={this.props.intl.formatMessage(messages.addUserFormTitle)}
            loading={this.props.createRequest.loading}
            schema={{
              fieldsets: [
                {
                  id: 'default',
                  title: 'FIXME: User Data',
                  fields: [
                    'username',
                    'fullname',
                    'email',
                    'password',
                    'roles',
                  ],
                },
              ],
              properties: {
                username: {
                  title: this.props.intl.formatMessage(
                    messages.addUserFormUsernameTitle,
                  ),
                  type: 'string',
                  description: '',
                },
                fullname: {
                  title: this.props.intl.formatMessage(
                    messages.addUserFormFullnameTitle,
                  ),
                  type: 'string',
                  description: '',
                },
                email: {
                  title: this.props.intl.formatMessage(
                    messages.addUserFormEmailTitle,
                  ),
                  type: 'string',
                  description: '',
                },
                password: {
                  title: this.props.intl.formatMessage(
                    messages.addUserFormPasswordTitle,
                  ),
                  type: 'string',
                  description: '',
                },
                roles: {
                  title: this.props.intl.formatMessage(
                    messages.addUserFormRolesTitle,
                  ),
                  type: 'array',
                  items: {
                    choices: this.props.roles.map(role => [role.id, role.id]),
                  },
                  description: '',
                },
              },
              required: ['username', 'fullname', 'email', 'password'],
            }}
          />
        </div>
        <Segment.Group raised>
          <Segment className="primary">
            <FormattedMessage
              id="Users and groups settings"
              defaultMessage="Users and groups settings"
            />
          </Segment>
          <Segment secondary>
            <FormattedMessage id="Users" defaultMessage="Users" />
          </Segment>
          <Segment>
            <Form onSubmit={this.onSearch}>
              <Form.Field>
                <Input
                  name="SearchableText"
                  action={{ icon: 'search' }}
                  placeholder={this.props.intl.formatMessage(
                    messages.searchUsers,
                  )}
                  onChange={this.onChangeSearch}
                />
              </Form.Field>
            </Form>
          </Segment>
          <Form onSubmit={this.onSubmit}>
            <Table padded striped attached>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>
                    <FormattedMessage
                      id="User name"
                      defaultMessage="User name"
                    />
                  </Table.HeaderCell>
                  {this.props.roles.map(role => (
                    <Table.HeaderCell key={role.id}>{role.id}</Table.HeaderCell>
                  ))}
                  <Table.HeaderCell>
                    <FormattedMessage id="Actions" defaultMessage="Actions" />
                  </Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {this.props.users.map(user => (
                  <UsersControlpanelUser
                    key={user.id}
                    onDelete={this.delete}
                    roles={this.props.roles}
                    user={user}
                  />
                ))}
              </Table.Body>
            </Table>
          </Form>
        </Segment.Group>
        <Portal node={__CLIENT__ && document.getElementById('toolbar')}>
          <Toolbar
            pathname={this.props.pathname}
            inner={
              <Link to={`${getBaseUrl(this.props.pathname)}`} className="item">
                <Icon
                  name="arrow left"
                  size="big"
                  color="blue"
                  title={this.props.intl.formatMessage(messages.back)}
                />
              </Link>
            }
          />
        </Portal>
      </div>
    );
  }
}
