import {
  Avatar,
  Box,
  Fade,
  Grid,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from "@mui/material";
import { useState } from "react";
import VizSensor from "react-visibility-sensor";

import "./FeatureItem.css";

export interface FeatureItemProps {
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  list?: {
    icon: JSX.Element;
    primaryText: string;
    secondaryText?: string;
  }[];
}

const FeatureItem = ({
  title,
  description,
  imageSrc,
  imageAlt,
  list,
}: FeatureItemProps) => {
  const [active, setActive] = useState(false);
  return (
    <VizSensor
      onChange={(isVisible: boolean) => {
        if (isVisible) {
          setActive(true);
        }
      }}
    >
      <Fade in={active} timeout={2000}>
        <Box sx={{ display: "flex", mb: 20 }}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6} lg={6}>
              <Typography variant="h3" color="text.primary" paragraph>
                {title}
              </Typography>
              <Typography variant="body1" color="text.primary" paragraph>
                {description}
              </Typography>
              {list && (
                <List >
                  {list.map((item) => (
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar>{item.icon}</Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={item.primaryText}
                        secondary={
                          item.secondaryText ? item.secondaryText : null
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Grid>
            <Grid item xs={12} md={6} lg={6}>
              <img src={imageSrc} alt={imageAlt} className="feature-image" />
            </Grid>
          </Grid>
        </Box>
      </Fade>
    </VizSensor>
  );
};

export default FeatureItem;
