import React from 'react';
import { AuthenticatedLayout } from '../components/shared';
import { UnavailableState } from '../components/AsyncState';

const Screen44ContentModeration = () => <AuthenticatedLayout title="Content Moderation" admin><UnavailableState title="Moderation queue is not connected" description="The current Django API does not expose moderation flags or review actions. This route remains available without fabricated submissions or approval controls." /></AuthenticatedLayout>;
export default Screen44ContentModeration;
