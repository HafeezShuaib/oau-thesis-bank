import React from 'react';
import { AuthenticatedLayout } from '../components/shared';
import { UnavailableState } from '../components/AsyncState';

const Screen26GapDetail = () => <AuthenticatedLayout title="Gap Analysis"><UnavailableState title="Gap analysis is not connected" description="The current API does not expose evidence synthesis or thesis limitation references." /></AuthenticatedLayout>;
export default Screen26GapDetail;
