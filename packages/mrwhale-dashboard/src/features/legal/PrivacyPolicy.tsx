import {
  Divider,
  Link,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";

const PrivacyPolicy = () => {
  return (
    <>
      <Typography
        component="h4"
        variant="h4"
        fontWeight={700}
        color="text.primary"
        gutterBottom
      >
        Privacy Policy
      </Typography>
      <Typography fontWeight="bold" variant="subtitle1" paragraph>
        Last updated: September 25, 2023
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <Typography variant="body1" color="text.secondary" paragraph>
        This page describes Our policies on the collection, use and disclosure
        of Your information when using the Service.
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        We use Your data to provide and improve the Service. By using the
        Service, You agree to the collection and use of information in
        accordance with this Privacy Policy.
      </Typography>
      <Typography
        component="h5"
        variant="h5"
        fontWeight={700}
        color="text.primary"
        gutterBottom
      >
        Definitions
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        <List sx={{ listStyle: "disc", ml: 5 }}>
          <ListItem sx={{ display: "list-item", m: 0, p: 0 }}>
            <ListItemText
              disableTypography
              sx={{ fontWeight: "bold" }}
              primary="Website"
            />

            <ListItemText secondary>
              Refers to our Website, accessible at:{" "}
              <Link href="https://www.mrwhale.io" underline="none">
                https://www.mrwhale.io
              </Link>
            </ListItemText>
          </ListItem>
          <ListItem sx={{ display: "list-item", m: 0, p: 0 }}>
            <ListItemText
              disableTypography
              sx={{ fontWeight: "bold" }}
              primary="Service"
            />

            <ListItemText secondary>
              Refers to the Website and the Discord Application 'Mr. Whale'.
            </ListItemText>
          </ListItem>
          <ListItem sx={{ display: "list-item", m: 0, p: 0 }}>
            <ListItemText
              disableTypography
              sx={{ fontWeight: "bold" }}
              primary="Bot"
            />

            <ListItemText secondary>
              Refers to the 'Mr. Whale' Discord Bot Application or 'Mr.
              Whale#0095'.
            </ListItemText>
          </ListItem>
          <ListItem sx={{ display: "list-item", m: 0, p: 0 }}>
            <ListItemText
              disableTypography
              sx={{ fontWeight: "bold" }}
              primary="Cookies"
            />

            <ListItemText secondary>
              Cookies are small files that are placed on Your computer, mobile
              device or any other device by a website.
            </ListItemText>
          </ListItem>
          <ListItem sx={{ display: "list-item", m: 0, p: 0 }}>
            <ListItemText
              disableTypography
              sx={{ fontWeight: "bold" }}
              primary="Creator"
            />

            <ListItemText secondary>
              Creator referred to as 'We', 'Us', 'Our'.
            </ListItemText>
          </ListItem>
          <ListItem sx={{ display: "list-item", m: 0, p: 0 }}>
            <ListItemText
              disableTypography
              sx={{ fontWeight: "bold" }}
              primary="You"
            />

            <ListItemText secondary>
              Refers to the individual accessing or using the Service, or the
              company, or other legal entity on behalf of which such individual
              is accessing or using the Service.
            </ListItemText>
          </ListItem>
        </List>
      </Typography>
      <Typography
        component="h5"
        variant="h5"
        fontWeight={700}
        color="text.primary"
        gutterBottom
      >
        Data Collection and Use
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        The Website stores all data authorized by the user through Discord's
        OAuth2 consent page. This data includes but not limited to your Discord
        Id, Username, Avatar and Banner. This data is stored in our databases
        and is NOT sold to any other parties. Users will be notified if any
        additional information is stored.
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        The Bot upon being added to any Discord Server/Guild may store your
        Guild and User Id. This data is used to track your Rank and Level across
        Discord Servers/Guilds.
      </Typography>
      <Typography
        component="h5"
        variant="h5"
        fontWeight={700}
        color="text.primary"
        gutterBottom
      >
        Cookies
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        The Website uses cookies to store information about users. These cookies
        store the session identifier for logged in users and are used for user
        authentication on the Website. Without these Cookies, the services that
        You have asked for cannot be provided, and We only use these Cookies to
        provide You with those services.
      </Typography>
      <Typography
        component="h5"
        variant="h5"
        fontWeight={700}
        color="text.primary"
        gutterBottom
      >
        Links to other websites
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        This website may contain links to other websites not operated by Us. If
        you click on any of these links, you will be directed to that website.
        We strongly advise you check the privacy policies of these 3rd party
        websites or services. We have no control or responsibility for the
        content, privacy policies or practices of any 3rd party website or
        services.
      </Typography>

      <Typography
        component="h5"
        variant="h5"
        fontWeight={700}
        color="text.primary"
        gutterBottom
      >
        Children's Privacy
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Our Service does not address anyone under the age of 13. We do not
        knowingly collect personally identifiable information from anyone under
        the age of 13. If You are a parent or guardian and You are aware that
        Your child has provided Us with Personal Data, please contact Us. If We
        become aware that We have collected Personal Data from anyone under the
        age of 13 without verification of parental consent, We take steps to
        remove that information from Our servers.
      </Typography>

      <Typography
        component="h5"
        variant="h5"
        fontWeight={700}
        color="text.primary"
        gutterBottom
      >
        Changes to this Privacy Policy
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        We may amend this Privacy Policy from time to time. We will notify You
        of any changes by posting the new Privacy Policy on this page. You are
        advised to review this Privacy Policy periodically for any changes.
        Changes to this Privacy Policy are effective when they are posted on
        this page.
      </Typography>
      <Typography
        component="h5"
        variant="h5"
        fontWeight={700}
        color="text.primary"
        gutterBottom
      >
        Contact
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        If you have any questions about this Privacy Policy, You can contact us
        at{" "}
        <Link href="contact@mrwhale.io" underline="none">
          contact@mrwhale.io
        </Link>
      </Typography>
    </>
  );
};

export default PrivacyPolicy;
