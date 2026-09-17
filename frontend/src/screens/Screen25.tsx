import React from 'react';
import { AuthenticatedLayout } from '../components/shared';
import { UnavailableState } from '../components/AsyncState';

const Screen25GapExplorer = () => <AuthenticatedLayout title="Research Gap Explorer"><UnavailableState title="Research gap exploration is not connected" description="No gap-clustering or future-work aggregation endpoint is available in the connected backend." /></AuthenticatedLayout>;
export default Screen25GapExplorer;
