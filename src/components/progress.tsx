import * as React from "react";
import { LinearProgress, makeStyles } from "@material-ui/core";

const useStyles = makeStyles({
  root: {
    flexGrow: 1,
  },
});

export function ProgressLine(props:{color?:'primary'|'secondary'}) {
    const classes = useStyles();
    return (
        <div className={classes.root}>
            <LinearProgress color={props.color||'primary'}/>
        </div>
    );
}