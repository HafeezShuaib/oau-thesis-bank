import React from 'react';
import { AuthenticatedLayout } from '../components/shared';
import { UnavailableState } from '../components/AsyncState';

const Screen13ResearchLineage = () => <AuthenticatedLayout title="Research Lineage"><UnavailableState title="Research lineage is not connected" description="The current API does not expose relationships between thesis records or lineage nodes." /></AuthenticatedLayout>;
export default Screen13ResearchLineage;
