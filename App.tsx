import * as React from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import Constants from "expo-constants";

export default function App() {
  const [redirectUrl, setRedirectUrl] = React.useState(null);
  const [redirectData, setRedirectData] = React.useState(null);
  const [getInitialURLData, setGetInitialURLData] = React.useState(null);

  console.log({
    redirectUrl,
    redirectData,
    getInitialURLData,
  })

  React.useEffect(() => {
    Linking.getInitialURL().then((url) => {
      setGetInitialURLData(url);
    });
  }, [setGetInitialURLData]);

  React.useEffect(() => {
    let listener = Linking.addEventListener("url", _handleRedirect);
    return () => {
      listener.remove();
    };
  }, []);

  const _handleRedirect = React.useCallback(
    (event) => {
      if (Constants.platform.ios) {
        WebBrowser.dismissBrowser();
      }

      let data = Linking.parse(event.url);

      setRedirectData(data);
      setRedirectUrl(event.url);
    },
    [setRedirectData, setRedirectUrl]
  );

  // openAuthSessionAsync doesn't require that you add Linking listeners, it
  // returns the redirect URL in the resulting Promise
  const _openAuthSessionAsync = React.useCallback(async () => {
    try {
      let result = await WebBrowser.openAuthSessionAsync(
        // We add `?` at the end of the URL since the test backend that is used
        // just appends `authToken=<token>` to the URL provided.
        `https://backend-xxswjknyfi.now.sh/?linkingUri=${Linking.createURL(
          "?"
        )}`
      );
      let redirectData;
      if (result.type === "success" && result.url) {
        redirectData = Linking.parse(result.url);
        setRedirectData(redirectData);
        setRedirectUrl(result.url);
      }
    } catch (error) {
      alert(error);
      console.log(error);
    }
  }, []);

  const _openBrowserAsync = React.useCallback(async () => {
    try {
      let result = await WebBrowser.openBrowserAsync(
        // We add `?` at the end of the URL since the test backend that is used
        // just appends `authToken=<token>` to the URL provided.
        `https://backend-xxswjknyfi.now.sh/?linkingUri=${Linking.createURL(
          "?"
        )}`
      );

      console.log(result);
    } catch (error) {
      alert(error);
      console.log(error);
    }
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.subheader}>Linking.getInitialURL()</Text>
      <Text style={styles.debug}>{getInitialURLData}</Text>
      <Text style={styles.subheader}>Linking.createURL('')</Text>
      <Text style={styles.debug}>{Linking.createURL("")}</Text>
      <Text style={styles.subheader}>Linking.createURL('?')</Text>
      <Text style={styles.debug}>{Linking.createURL("?")}</Text>
      <Text style={styles.subheader}>Scheme://</Text>
      <Text style={styles.debug}>{Constants.expoConfig.scheme}://</Text>

      <View style={styles.separator} />

      <Button onPress={_openBrowserAsync} title="Try openBrowserAsync" />

      <Button
        onPress={_openAuthSessionAsync}
        title="Try openAuthSessionAsync"
      />

      {redirectData ? (
        <>
          <View style={styles.separator} />
          <Text style={styles.subheader}>Redirect URL</Text>
          <Text style={styles.debug}>{redirectUrl}</Text>
          <Text style={styles.subheader}>Linking.parse(redirectUrl)</Text>
          <Text style={styles.debug}>{JSON.stringify(redirectData)}</Text>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 40,
  },
  subheader: {
    fontSize: 12,
    fontFamily: "Menlo",
    marginTop: 10,
    marginBottom: 5,
    opacity: 0.7,
  },
  debug: {
    fontFamily: "Menlo",
    fontSize: 12,
    marginTop: 1,
  },
  separator: {
    height: 1,
    backgroundColor: "#000",
    marginBottom: 10,
    marginTop: 20,
    width: "80%",
    opacity: 0.1,
  },
});
