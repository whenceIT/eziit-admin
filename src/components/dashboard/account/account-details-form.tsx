//update api endpoint
'use client';

import * as React from 'react';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Grid from '@mui/material/Unstable_Grid2';
import { useUser } from '@/hooks/use-user';

export function AccountDetailsForm(): React.JSX.Element {
  const { user } = useUser();
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [formData, setFormData] = React.useState({
    industry_type: '',
    year_founded: '',
    media_presence: '',
    headquarters_location: '',
    additional_locations: '',
    ceo_name: '',
    ceo_phone_number: '',
    ceo_email: '',
    ceo_nrc: '',
    cfo_name: '',
    cfo_phone_number: '',
    cfo_email: '',
    cfo_nrc: '',
    hr_name: '',
    hr_phone_number: '',
    hr_email: '',
    hr_nrc: '',
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!user) {
      console.error('User not logged in');
      return;
    }

    try {
      const response = await fetch('https://ezitt.whencefinancesystem.com/info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id, //include user id
          ...formData,
        }),
      });

      if (response.ok) {
        setIsSubmitted(true); //true so its uneditable
      } else {
        console.error('Failed to submit company info');
      }
    } catch (error) {
      console.error('Error submitting company info:', error);
    }
  };

  if (!user) {
    return <div>Loading user information...</div>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader title="Company Information" />
        <Divider />
        <CardContent>
          <Grid container spacing={3}>
           
            <Grid md={6} xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Industry Type</InputLabel>
                <OutlinedInput
                  value={formData.industry_type}
                  onChange={handleChange}
                  label="Industry Type"
                  name="industry_type"
                  disabled={isSubmitted}
                />
              </FormControl>
            </Grid>

           
            <Grid md={6} xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Year Founded</InputLabel>
                <OutlinedInput
                  value={formData.year_founded}
                  onChange={handleChange}
                  label="Year Founded"
                  name="year_founded"
                  type="number"
                  disabled={isSubmitted}
                />
              </FormControl>
            </Grid>

            
            <Grid md={6} xs={12}>
              <FormControl fullWidth>
                <InputLabel>Media Presence (Company Website)</InputLabel>
                <OutlinedInput
                  value={formData.media_presence}
                  onChange={handleChange}
                  label="Media Presence (Company Website)"
                  name="media_presence(Company Website)"
                  disabled={isSubmitted}
                />
              </FormControl>
            </Grid>

            
            <Grid md={6} xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Headquarters Location</InputLabel>
                <OutlinedInput
                  value={formData.headquarters_location}
                  onChange={handleChange}
                  label="Headquarters Location"
                  name="headquarters_location"
                  disabled={isSubmitted}
                />
              </FormControl>
            </Grid>

            
            <Grid md={12} xs={12}>
              <FormControl fullWidth>
                <InputLabel>Additional Locations</InputLabel>
                <OutlinedInput
                  value={formData.additional_locations}
                  onChange={handleChange}
                  label="Additional Locations"
                  name="additional_locations"
                  multiline
                  rows={4}
                  disabled={isSubmitted}
                />
              </FormControl>
            </Grid>

            
            <Grid md={6} xs={12}>
              <FormControl fullWidth required>
                <InputLabel>CEO Name</InputLabel>
                <OutlinedInput
                  value={formData.ceo_name}
                  onChange={handleChange}
                  label="CEO Name"
                  name="ceo_name"
                  disabled={isSubmitted}
                />
              </FormControl>
            </Grid>
            <Grid md={6} xs={12}>
              <FormControl fullWidth required>
                <InputLabel>CEO Phone Number</InputLabel>
                <OutlinedInput
                  value={formData.ceo_phone_number}
                  onChange={handleChange}
                  label="CEO Phone Number"
                  name="ceo_phone_number"
                  disabled={isSubmitted}
                />
              </FormControl>
            </Grid>
            <Grid md={6} xs={12}>
              <FormControl fullWidth required>
                <InputLabel>CEO Email</InputLabel>
                <OutlinedInput
                  value={formData.ceo_email}
                  onChange={handleChange}
                  label="CEO Email"
                  name="ceo_email"
                  type="email"
                  disabled={isSubmitted}
                />
              </FormControl>
            </Grid>
            <Grid md={6} xs={12}>
              <FormControl fullWidth required>
                <InputLabel>CEO NRC</InputLabel>
                <OutlinedInput
                  value={formData.ceo_nrc}
                  onChange={handleChange}
                  label="CEO NRC"
                  name="ceo_nrc"
                  disabled={isSubmitted}
                />
              </FormControl>
            </Grid>

           
            <Grid md={6} xs={12}>
              <FormControl fullWidth required>
                <InputLabel>CFO Name</InputLabel>
                <OutlinedInput
                  value={formData.cfo_name}
                  onChange={handleChange}
                  label="CFO Name"
                  name="cfo_name"
                  disabled={isSubmitted}
                />
              </FormControl>
            </Grid>
            <Grid md={6} xs={12}>
              <FormControl fullWidth required>
                <InputLabel>CFO Phone Number</InputLabel>
                <OutlinedInput
                  value={formData.cfo_phone_number}
                  onChange={handleChange}
                  label="CFO Phone Number"
                  name="cfo_phone_number"
                  disabled={isSubmitted}
                />
              </FormControl>
            </Grid>
            <Grid md={6} xs={12}>
              <FormControl fullWidth required>
                <InputLabel>CFO Email</InputLabel>
                <OutlinedInput
                  value={formData.cfo_email}
                  onChange={handleChange}
                  label="CFO Email"
                  name="cfo_email"
                  type="email"
                  disabled={isSubmitted}
                />
              </FormControl>
            </Grid>
            <Grid md={6} xs={12}>
              <FormControl fullWidth required>
                <InputLabel>CFO NRC</InputLabel>
                <OutlinedInput
                  value={formData.cfo_nrc}
                  onChange={handleChange}
                  label="CFO NRC"
                  name="cfo_nrc"
                  disabled={isSubmitted}
                />
              </FormControl>
            </Grid>

            
            <Grid md={6} xs={12}>
              <FormControl fullWidth required>
                <InputLabel>HR Name</InputLabel>
                <OutlinedInput
                  value={formData.hr_name}
                  onChange={handleChange}
                  label="HR Name"
                  name="hr_name"
                  disabled={isSubmitted}
                />
              </FormControl>
            </Grid>
            <Grid md={6} xs={12}>
              <FormControl fullWidth required>
                <InputLabel>HR Phone Number</InputLabel>
                <OutlinedInput
                  value={formData.hr_phone_number}
                  onChange={handleChange}
                  label="HR Phone Number"
                  name="hr_phone_number"
                  disabled={isSubmitted}
                />
              </FormControl>
            </Grid>
            <Grid md={6} xs={12}>
              <FormControl fullWidth required>
                <InputLabel>HR Email</InputLabel>
                <OutlinedInput
                  value={formData.hr_email}
                  onChange={handleChange}
                  label="HR Email"
                  name="hr_email"
                  type="email"
                  disabled={isSubmitted}
                />
              </FormControl>
            </Grid>
            <Grid md={6} xs={12}>
              <FormControl fullWidth required>
                <InputLabel>HR NRC</InputLabel>
                <OutlinedInput
                  value={formData.hr_nrc}
                  onChange={handleChange}
                  label="HR NRC"
                  name="hr_nrc"
                  disabled={isSubmitted}
                />
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
        <Divider />
        <CardActions sx={{ justifyContent: 'flex-end' }}>
          <Button type="submit" variant="contained" disabled={isSubmitted}>
            {isSubmitted ? 'Submitted' : 'Submit'}
          </Button>
        </CardActions>
      </Card>
    </form>
  );
}