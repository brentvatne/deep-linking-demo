import * as React from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import Constants from "expo-constants";

// if (Constants.executionEnvironment === 'storeClient') {
//   throw new Error('This example is meant to be run either with expo-dev-client or in a standalone app.')
// }

export default class App extends React.Component {
  state = {
    redirectUrl: null,
    redirectData: null,
    getInitialURLData: null,
  };

  componentDidMount() {
    Linking.getInitialURL().then((url) => {
      this.setState({ getInitialURLData: url });
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.subheader}>Linking.getInitialURL()</Text>
        <Text style={styles.debug}>{this.state.getInitialURLData}</Text>
        <Text style={styles.subheader}>Linking.createURL('/')</Text>
        <Text style={styles.debug}>{Linking.createURL("/")}</Text>
        <Text style={styles.subheader}>Scheme://</Text>
        <Text style={styles.debug}>{Constants.expoConfig.scheme}://</Text>

        <View style={styles.separator} />

        <Button onPress={this._openBrowserAsync} title="Try openBrowserAsync" />

        <Button
          onPress={this._openAuthSessionAsync}
          title="Try openAuthSessionAsync"
        />

        {this._maybeRenderRedirectData()}
      </View>
    );
  }

  _handleRedirect = (event) => {
    if (Constants.platform.ios) {
      WebBrowser.dismissBrowser();
    }

    let data = Linking.parse(event.url);

    this.setState({ redirectData: data, redirectUrl: event.url });
  };

  // openAuthSessionAsync doesn't require that you add Linking listeners, it
  // returns the redirect URL in the resulting Promise
  _openAuthSessionAsync = async () => {
    try {
      let result = await WebBrowser.openAuthSessionAsync(
        // We add `?` at the end of the URL since the test backend that is used
        // just appends `authToken=<token>` to the URL provided.
        `https://backend-xxswjknyfi.now.sh/?linkingUri=${Linking.createURL(
          "/?"
        )}`
      );
      let redirectData;
      if (result.type === "success" && result.url) {
        redirectData = Linking.parse(result.url);
        this.setState({ result, redirectData, redirectUrl: result.url });
      }
    } catch (error) {
      alert(error);
      console.log(error);
    }
  };

  // openBrowserAsync requires that you subscribe to Linking events and the
  // resulting Promise only contains information about whether it was canceled
  // or dismissed
  _openBrowserAsync = async () => {
    let listener = Linking.addEventListener("url", this._handleRedirect);
    try {
      let result = await WebBrowser.openBrowserAsync(
        // We add `?` at the end of the URL since the test backend that is used
        // just appends `authToken=<token>` to the URL provided.
        `https://backend-xxswjknyfi.now.sh/?linkingUri=${Linking.createURL(
          "/?"
        )}`
      );

      this.setState({ result });
    } catch (error) {
      alert(error);
      console.log(error);
    } finally {
      listener.remove();
    }
  };

  _maybeRenderRedirectData = () => {
    if (!this.state.redirectData) {
      return;
    }

    return (
      <>
        <View style={styles.separator} />
        <Text style={styles.subheader}>Redirect URL</Text>
        <Text style={styles.debug}>{this.state.redirectUrl}</Text>
        <Text style={styles.subheader}>Linking.parse(redirectUrl)</Text>
        <Text style={styles.debug}>
          {JSON.stringify(this.state.redirectData)}
        </Text>
      </>
    );
  };
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
