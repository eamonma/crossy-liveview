import {
  ApolloClient,
  ApolloProvider,
  HttpLink,
  InMemoryCache,
  split,
} from "@apollo/client"
import { WebSocketLink } from "@apollo/client/link/ws"
import { getMainDefinition } from "@apollo/client/utilities"
import React from "react"
import ReactDOM from "react-dom"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import App from "./App"
import GameView from "./GameView"
import "./index.css"
import reportWebVitals from "./reportWebVitals"

const httpLink = new HttpLink({
  uri: process.env.REACT_APP_HTTP_LINK_URI as string,
})

const wsLink = new WebSocketLink({
  uri: process.env.REACT_APP_WS_LINK_URI as string,
  options: {
    reconnect: true,
  },
})

// https://www.apollographql.com/docs/react/data/subscriptions/#setting-up-the-transport
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query)
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    )
  },
  wsLink,
  httpLink
)

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
})

ReactDOM.render(
  <ApolloProvider client={client}>
    <BrowserRouter>
      {/* <App /> */}
      <Routes>
        {/* <Route path="game" element={<Layout />}> */}
        <Route path="/" element={<App />} />
        <Route path="/game/:gameId" element={<GameView />} />
        {/* </Route> */}
      </Routes>
    </BrowserRouter>
  </ApolloProvider>,
  document.getElementById("root")
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
