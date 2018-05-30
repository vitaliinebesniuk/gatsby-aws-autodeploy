module.exports = {
  siteMetadata: {
    title: `Gatsby Default Starter`,
  },
  plugins: [
    {
      resolve: 'gatsby-source-contentful',
      options: {
        spaceId: '830wn6n75lhd',
        accessToken: '9bce750f36d15442949d8a664e009d4d97ebea79fc23cad5a136774b8d2e1cbe'
      }
    },
    `gatsby-transformer-remark`,
    `gatsby-plugin-react-helmet`
  ],
}
