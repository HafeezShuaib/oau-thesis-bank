import React from 'react';
import { AuthenticatedLayout } from '../components/shared';
import { UnavailableState } from '../components/AsyncState';

const Screen45UserManagement = () => <AuthenticatedLayout title="User Management" admin><UnavailableState title="User management is not connected" description="The current Django API exposes the authenticated user but not an admin user directory or role/status mutation endpoint." /></AuthenticatedLayout>;
export default Screen45UserManagement;
