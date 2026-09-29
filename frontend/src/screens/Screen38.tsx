import React from 'react';
import { AuthenticatedLayout } from '../components/shared';
import { UnavailableState } from '../components/AsyncState';

const Screen38PersonalAnalytics = () => <AuthenticatedLayout title="My Research Analytics"><UnavailableState title="Personal analytics are not connected" description="The current Django analytics API exposes institution-level admin/faculty aggregates only; it does not expose personal views, downloads, citations, or search appearances." /></AuthenticatedLayout>;
export default Screen38PersonalAnalytics;
