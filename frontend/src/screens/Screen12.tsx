import React from 'react';
import { AuthenticatedLayout } from '../components/shared';
import { UnavailableState } from '../components/AsyncState';

const Screen12ThesisDiscussion = () => <AuthenticatedLayout title="Thesis Discussion"><UnavailableState title="Thesis discussions are not connected" description="The current backend exposes direct messages but no thesis discussion or comment endpoints." /></AuthenticatedLayout>;
export default Screen12ThesisDiscussion;
