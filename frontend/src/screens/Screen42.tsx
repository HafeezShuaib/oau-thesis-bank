import React from 'react';
import { useAppRouter, AuthenticatedLayout } from '../components/shared';
import { UnavailableState } from '../components/AsyncState';

const Screen42PrivacySettings = () => <AuthenticatedLayout title="Privacy & Access"><UnavailableState title="Privacy preferences are not connected" description="The current Django user and researcher profile serializers do not expose profile visibility or direct-message preference fields. No local-only toggles are presented as persisted settings." /></AuthenticatedLayout>;
export default Screen42PrivacySettings;
