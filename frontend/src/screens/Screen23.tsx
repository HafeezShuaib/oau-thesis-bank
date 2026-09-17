import React from 'react';
import { AuthenticatedLayout } from '../components/shared';
import { UnavailableState } from '../components/AsyncState';

const Screen23IdeaSimilarity = () => <AuthenticatedLayout title="Similarity Analysis Results"><UnavailableState title="Similarity analysis is not connected" description="The backend does not expose similarity scores or related-project analysis, so no fabricated matches are shown." /></AuthenticatedLayout>;
export default Screen23IdeaSimilarity;
