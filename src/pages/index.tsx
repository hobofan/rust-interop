import React, { ReactElement, useState } from "react"
import { useStaticQuery, graphql } from "gatsby"
import loadable from "@loadable/component"
import shuffle from "lodash.shuffle"

const TextTransition = loadable(() => import("react-text-transition"))

interface Props {}

function Index({}: Props): ReactElement {
  const [isMenuOpen, setMenuOpen] = useState(false)
  const data = useStaticQuery(graphql`
    query {
      allMarkdownRemark {
        edges {
          node {
            frontmatter {
              title
              crate
              repo
              url
              host_lang
              guest_lang
              description
              requires_nightly
            }
          }
        }
      }
    }
  `)

  const libs = data.allMarkdownRemark.edges.map(n => n.node)
  const hostLangs = libs.map(n => n.frontmatter.host_lang)
  const guestLangs = libs.map(n => n.frontmatter.guest_lang)

  let allLangs = hostLangs.concat(guestLangs).filter(n => n !== "Rust")
  allLangs = [...new Set(allLangs)]
  allLangs.sort()
  const guestLibs = guestLang =>
    libs.filter(n => n.frontmatter.guest_lang === guestLang)
  const hostLibs = hostLang =>
    libs.filter(n => n.frontmatter.host_lang === hostLang)

  return (
    <>
      <GithubCorner />
      <div className="container max-w-xl mx-auto mt-10 relative">
        <div className="text-center text-3xl md:text-6xl font-bold my-8 mt-20">
          <RotatingHeader libs={libs} />
        </div>
        <p className="text-xl">
          This page aims to give a comprehensive overview of the available
          language interop options for the Rust programming language.
        </p>
        <br />
        <p className="text-xl">
          We want to highlight libraries that enable using:
          <br />- <b>Rust as a guest language</b> (e.g. "Rust in Python" for
          speeding up Python libraries)
          <br />- <b>Using other guest languages from Rust</b>
          (e.g. "Python in Rust" for taking advantage of rich foreign
          ecosystems)
        </p>
        <br />
        <br />
        <p className="text-xl">
          This page aims to highlight deep integrations between Rust and a
          specific foreign language. Luckily, even if those do not exist, we can
          fall back to FFI or other polyglot technologies (e.g. WASM).
          <br />
          <br />
          Some links for more generalized foreign language integrations: <br />-
          <a
            href="https://doc.rust-lang.org/nomicon/ffi.html"
            className="underline"
          >
            Rustonomicon chapter about FFI
          </a>
          <br />-
          <a
            href="https://github.com/alexcrichton/rust-ffi-examples"
            className="underline"
          >
            Examples for using FFI with many languages
          </a>
          <br />-
          <a
            href="https://github.com/rust-lang/rust-bindgen"
            className="underline"
          >
            bindgen crate to automatically generate Rust FFI bindings to C (and
            some C++) libraries.
          </a>
          <br />-
          <a
            href="https://rustwasm.github.io/docs/book/print.html"
            className="underline"
          >
            Rust and Webassembly book
          </a>
        </p>
        <div className="py-4"></div>
        {allLangs.map((lang: String) => {
          return (
            <>
              <h1 id={lang.toLowerCase()}>
                <a href={`#${lang.toLowerCase()}`}>{lang}</a>
              </h1>
              {guestLibs(lang).length === 0 ? null : (
                <>
                  <h2 id={`${lang.toLowerCase()}-in-rust`}>
                    <a
                      href={`#${lang.toLowerCase()}-in-rust`}
                    >{`${lang} in Rust`}</a>
                  </h2>
                  {guestLibs(lang).map(lib => (
                    <LibraryCard {...lib} />
                  ))}
                </>
              )}
              {hostLibs(lang).length === 0 ? null : (
                <>
                  <h2 id={`rust-in-${lang.toLowerCase()}`}>
                    <a
                      href={`#rust-in-${lang.toLowerCase()}`}
                    >{`Rust in ${lang}`}</a>
                  </h2>
                  {hostLibs(lang).map(lib => (
                    <LibraryCard {...lib} />
                  ))}
                </>
              )}
            </>
          )
        })}
        <div className="text-center underline text-3xl my-8">
          <a href="https://github.com/hobofan/rust-interop">
            Missing a integration? Feel free to contribute!
          </a>
        </div>
      </div>
    </>
  )
}

type CardProps = {
  frontmatter: {
    title: String
    repo?: String
    url?: String
    crate?: String
    guest_lang: String
    host_lang: String
    description: String
    requires_nightly?: boolean
  }
}

function LibraryCard(props: CardProps): ReactElement {
  const cratesUrl = () =>
    props.frontmatter.crate
      ? `https://crates.io/crates/${props.frontmatter.crate}`
      : null
  const mainUrl = () =>
    props.frontmatter.url || props.frontmatter.repo || cratesUrl()

  return (
    <div className="rounded overflow-hidden shadow-lg my-4">
      <div className="px-6 py-4">
        <a href={mainUrl()} className="font-bold text-xl mb-2">
          {props.frontmatter.title}
        </a>
        {props.frontmatter.requires_nightly ? (
          <span className="inline-block bg-px-3 py-1 text-sm font-semibold bg-red-700 text-white mr-2 rounded-full px-2 mx-2">
            Requires nightly
          </span>
        ) : null}
        <p className="mt-4 text-gray-700 text-base">
          {props.frontmatter.description}
        </p>
      </div>
      <div className="px-6 py-4 flex">
        {cratesUrl() ? (
          <span className="inline-block bg-px-3 py-1 text-sm font-semibold text-gray-700 mr-2">
            <a href={cratesUrl()}>
              <img
                src={`http://meritbadge.herokuapp.com/${props.frontmatter.crate}`}
              />
            </a>
          </span>
        ) : null}
        <span className="inline-block bg-px-3 py-1 text-sm font-semibold mr-2 underline">
          <a href={props.frontmatter.repo}>{"Repo"}</a>
        </span>
      </div>
    </div>
  )
}

function RotatingHeader({ libs }): ReactElement {
  const TEXTS = shuffle(libs).map(lib => {
    const xiny = `${lib.frontmatter.guest_lang} in ${lib.frontmatter.host_lang}`
    const xinyAnchor = xiny.toLowerCase().replace(/\ /gi, "-")
    return { text: xiny, anchor: xinyAnchor }
  })

  const [index, setIndex] = React.useState(0)

  React.useEffect(() => {
    const intervalId = setInterval(
      () => setIndex(index => index + 1),
      3000 // every 3 seconds
    )
  }, [])

  return (
    <a href={`#${TEXTS[index % TEXTS.length].anchor}`}>
      <TextTransition text={TEXTS[index % TEXTS.length].text} />
    </a>
  )
}

function GithubCorner(): ReactElement {
  return (
    <a
      href="https://github.com/hobofan/rust-interop"
      className="github-corner"
      aria-label="View source on GitHub"
    >
      <svg
        width="80"
        height="80"
        viewBox="0 0 250 250"
        style={{
          fill: "#FD6C6C",
          color: "#fff",
          position: "absolute",
          top: 0,
          border: 0,
          right: 0,
        }}
        aria-hidden="true"
      >
        <path d="M0,0 L115,115 L130,115 L142,142 L250,250 L250,0 Z"></path>
        <path
          d="M128.3,109.0 C113.8,99.7 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.6 120.5,78.6 C119.2,72.0 123.4,76.3 123.4,76.3 C127.3,80.9 125.5,87.3 125.5,87.3 C122.9,97.6 130.6,101.9 134.4,103.2"
          fill="currentColor"
          style={{ transformOrigin: "130px 106px" }}
          className="octo-arm"
        ></path>
        <path
          d="M115.0,115.0 C114.9,115.1 118.7,116.5 119.8,115.4 L133.7,101.6 C136.9,99.2 139.9,98.4 142.2,98.6 C133.8,88.0 127.5,74.4 143.8,58.0 C148.5,53.4 154.0,51.2 159.7,51.0 C160.3,49.4 163.2,43.6 171.4,40.1 C171.4,40.1 176.1,42.5 178.8,56.2 C183.1,58.6 187.2,61.8 190.9,65.4 C194.5,69.0 197.7,73.2 200.1,77.6 C213.8,80.2 216.3,84.9 216.3,84.9 C212.7,93.1 206.9,96.0 205.4,96.6 C205.1,102.4 203.0,107.8 198.3,112.5 C181.9,128.9 168.3,122.5 157.7,114.1 C157.9,116.9 156.7,120.9 152.7,124.9 L141.0,136.5 C139.8,137.7 141.6,141.9 141.8,141.8 Z"
          fill="currentColor"
          className="octo-body"
        ></path>
      </svg>
    </a>
  )
}

export default Index
