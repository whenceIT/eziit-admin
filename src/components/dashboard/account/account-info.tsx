'use client';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useUser } from '@/hooks/use-user';

export function AccountInfo(): React.JSX.Element {
  const { user } = useUser();

  if (!user) {
    return <Typography>Loading user information...</Typography>;
  }

  return (
    <Card>
      <CardContent>
        <Stack spacing={2} sx={{ alignItems: 'center' }}>
          <div>
            <Avatar src={user.avatar || '/assets/default-avatar.png'} sx={{ height: '80px', width: '80px' }} />
          </div>
          <Stack spacing={1} sx={{ textAlign: 'center' }}>
            <Typography variant="h5">{`${user.first_name} ${user.last_name}`}</Typography>
            {/*<Typography color="text.secondary" variant="body2">
              {user.city} {user.country}
            </Typography>
            {/*<Typography color="text.secondary" variant="body2">
              {user.timezone || 'Timezone not set'}
            </Typography>*/}
          </Stack>
        </Stack>
      </CardContent>
      <Divider />
      <CardActions>
        {/*<Button fullWidth variant="text">
          Upload picture
        </Button>*/}
      </CardActions>
    </Card>
  );
}