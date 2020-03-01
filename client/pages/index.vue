<template>
  <div class="main">
    <div>
      <h1 class="title">
        Color palettes feat. COTOHA API
      </h1>
      <div class="container">
        <textarea
          v-model="sentence"
          class="textarea"
          placeholder="『構文解析をする』『色も解析する』 「両方」やらなくちゃあならないってのが「このアプリ」のつらいところだな 覚悟はいいか？ オレはできてる"
        ></textarea>
        <button
          class="button is-rounded is-large"
          :class="{ 'is-loading': isLoading }"
          @click="analysis"
        >
          解析解析解析解析ィーー！
        </button>
      </div>
      <section
        v-if="output"
        id="output-area"
        class="hero is-fullheight"
        :style="styleObject"
      >
        <div class="hero-body">
          <div class="container">
            <p class="output">{{ output }}</p>
          </div>
        </div>
      </section>
      <div v-if="output" class="container">
        <div class="box columns is-multiline">
          <pos-highlighter
            v-for="token in tokens"
            :key="token.id"
            class="column"
            :word="token.value"
            :pos="token.pos"
          />
        </div>
        <div class="box">
          <div class="table-container">
            <table class="table is-fullwidth">
              <tr>
                <th>キーワード</th>
                <th>検索結果</th>
                <th>カラーコード</th>
              </tr>
              <tr v-for="(result, key) in searchResults" :key="key">
                <td>{{ result.keyword }}</td>
                <td>{{ result.title }}</td>
                <td>
                  <div
                    class="color-code"
                    :style="{ background: result.code }"
                  />
                  <div>{{ result.code }}</div>
                </td>
              </tr>
            </table>
          </div>
        </div>
      </div>
      <footer class="footer">
        <div class="content has-text-centered">
          <p>
            Designed & Developed By
            <a href="https://twitter.com/azukisiromochi">@azukisiromochi</a>
            <a
              target="_blank"
              rel="noopener"
              aria-label="GitHub"
              href="https://github.com/azukisiromochi/color-palettes-feat-cotoha-api"
            >
              <fa :icon="faGithub" />
            </a>
          </p>
        </div>
      </footer>
    </div>
    <div v-if="viewableAlert" class="notification is-danger is-light">
      <button class="delete" @click="closeAlert"></button>
      <p class="subtitle is-5"><b>解析処理でエラーが発生しました</b></p>
      <div class="has-text-left">
        このアプリは <b>COTOHA API for Developers</b> を利用しているため、 API
        の呼び出しが 1 日に 1000 回に制限されています。<br />
        時間をおいても解消しない場合は、日を変えてお試しくださいませ 🙇
      </div>
    </div>
  </div>
</template>

<script>
import { toast } from 'bulma-toast'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import PosHighlighter from '~/components/PosHighlighter.vue'

export default {
  components: {
    PosHighlighter
  },
  data() {
    return {
      isLoading: false,
      viewableAlert: false,
      sentence: null,
      output: null,
      tokens: [],
      searchResults: [],
      styleObject: {
        color: 'black',
        background: 'white'
      }
    }
  },
  computed: {
    faGithub() {
      return faGithub
    }
  },
  methods: {
    analysis() {
      this.reset()
      this.isLoading = true

      this.cotohaParse()
        .then((r) => {
          const tokens = _(r.result)
            .flatMap('tokens')
            .map((token) => {
              return {
                id: token.id,
                value: token.form,
                pos: token.pos
              }
            })
            // .reject(['pos', '空白'])
            .value()

          this.tokens = tokens
          toast({
            message: '構文解析が終わりました',
            type: 'is-success',
            duration: 2000,
            opacity: 0.8
          })
          this.search(_.uniqBy(tokens, 'value'))
        })
        .catch((e) => {
          console.error(e)
          this.viewableAlert = true
          this.isLoading = false
        })
    },
    reset() {
      this.output = null
      this.tokens = []
      this.searchResults = []
      this.styleObject = {
        color: 'black',
        background: 'white'
      }
    },
    cotohaParse() {
      return this.$axios.$post(`${process.env.baseUrl}/api/cotoha_parse`, {
        sentence: this.sentence
      })
    },
    async search(tokens) {
      for (const token of tokens) {
        if (token.pos === '名詞') {
          toast({
            message: '色を解析中…… ⏳',
            type: 'is-warning',
            position: 'center',
            duration: 1000,
            opacity: 0.8
          })
          await this.searchColorCode(token.value)
            .then((title) => {
              this.searchResults.push({
                keyword: token.value,
                title,
                code: _.head(title.match(/#[0-9A-Fa-f]{6}/))
              })
            })
            .catch((e) => {
              console.error(e)
              this.viewableAlert = true
              this.isLoading = false
            })
        }
      }

      const colors = _(this.searchResults)
        .filter((r) => !!r.code)
        .map('code')
        .value()

      if (!_.isEmpty(colors)) {
        this.styleObject.background = this.makeBackground(colors)
        if (this.meanLightness(colors) > 50) {
          this.styleObject.color = 'black'
        } else {
          this.styleObject.color = 'white'
        }
      }

      this.isLoading = false
      this.output = this.sentence
      setTimeout(() => this.$scrollTo('#output-area'))
    },
    searchColorCode(keyword) {
      return this.$axios.$get(`${process.env.baseUrl}/api/search_color_code`, {
        params: { keyword }
      })
    },
    rgb16ToHsl(colorcode) {
      const _code = colorcode.replace(/^#/, '')

      const digits = Math.floor(_code.length / 3)
      if (digits < 1) {
        return false
      }

      const rgb = []
      for (let i = 0; i < 3; i++) {
        rgb.push(parseInt(_code.slice(digits * i, digits * (i + 1)), 16))
      }

      const red = rgb[0] / 255
      const green = rgb[1] / 255
      const blue = rgb[2] / 255

      const hue = this.hueOf(red, green, blue)
      const lightness = this.lightnessOf(red, green, blue)
      const saturation = this.saturationOf(red, green, blue, lightness)

      return {
        hue: Math.round(hue * 360),
        saturation: Math.round(saturation * 100),
        lightness: Math.round(lightness * 100)
      }
    },
    hueOf(red, green, blue) {
      const max = Math.max(red, green, blue)
      const min = Math.min(red, green, blue)

      let hue = 0
      if (max !== min) {
        const diff = max - min

        if (max === red) {
          hue = (green - blue) / diff
        } else if (max === green) {
          hue = 2 + (blue - red) / diff
        } else {
          hue = 4 + (red - green) / diff
        }
        hue /= 6
      }
      return hue
    },
    lightnessOf(red, green, blue) {
      const max = Math.max(red, green, blue)
      const min = Math.min(red, green, blue)
      return (max + min) / 2
    },
    saturationOf(red, green, blue, lightness) {
      const max = Math.max(red, green, blue)
      const min = Math.min(red, green, blue)

      let saturation = 0
      if (max !== min) {
        const diff = max - min

        if (lightness > 0.5) {
          saturation = diff / (2 - max - min)
        } else {
          saturation = diff / (max + min)
        }
      }
      return saturation
    },
    makeBackground(colors) {
      if (colors.length === 1) {
        return colors[0]
      } else {
        return 'linear-gradient(25deg, ' + _.join(colors, ',') + ')'
      }
    },
    meanLightness(colors) {
      return _(colors)
        .map((color) => {
          return this.rgb16ToHsl(color)
        })
        .map('lightness')
        .mean()
    },
    closeAlert() {
      this.viewableAlert = false
    }
  }
}
</script>

<style lang="scss">
.main {
  margin: 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.title {
  font-family: 'Quicksand', 'Source Sans Pro', -apple-system, BlinkMacSystemFont,
    'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  display: block;
  font-weight: 300;
  font-size: 4em;
  color: #35495e;
  letter-spacing: 1px;
  margin-top: 25vh;
}

.textarea,
.button,
.hero,
.box {
  margin: 3em 0;
}

.button {
  font-family: 'Sawarabi Mincho', 'Noto Serif JP', sans-serif;
}

.hero,
.footer {
  width: 100vw;
}

.output {
  font-family: 'Sawarabi Mincho', 'Noto Serif JP', sans-serif;
  padding: 15px;
  font-weight: 300;
  font-size: 4em;
}

.column {
  flex-basis: auto;
}

.color-code {
  width: 1em;
  height: 1em;
  float: left;
  margin: 0.25em;
}

.footer {
  margin-top: 25vh;

  a {
    color: #0d0015;
    &:hover {
      opacity: 0.6;
    }
  }
}

.notification {
  position: absolute;
  width: 30vw;
  top: 30vh;
}
</style>
