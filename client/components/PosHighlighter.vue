<template>
  <div v-if="output" :data-tooltip="pos">
    <p>{{ output }}</p>
    <div class="highlighter" :style="{ background: bgColor }"></div>
  </div>
</template>

<script>
export default {
  props: {
    word: {
      type: String,
      required: true,
      default: null
    },
    pos: {
      type: String,
      required: true,
      default: null
    }
  },
  data() {
    return {
      output: null,
      bgColor: 'black'
    }
  },
  mounted() {
    this.output = this.word

    const colors = {
      名詞: '#ffd900',
      名詞接尾辞: '#a22041',
      冠名詞: '#4c6cb3',
      英語接尾辞: '#8d6449',
      動詞語幹: '#aacf53',
      動詞活用語尾: '#ee836f',
      動詞接尾辞: '#1e50a2',
      冠動詞: '#674196',
      補助名詞: '#f08300',
      形容詞語幹: '#028760',
      形容詞接尾辞: '#203744',
      冠形容詞: '#fef263',
      連体詞: '#7ebeab',
      連用詞: '#460e44',
      接続詞: '#f7bd8f',
      独立詞: '#640125',
      接続接尾辞: '#e2041b',
      判定詞: '#715c1f',
      格助詞: '#f09199',
      引用助詞: '#b44c97',
      連用助詞: '#d0576b',
      終助詞: '#bb5535',
      間投詞: '#a2d7dd',
      括弧: 'black',
      句点: 'black',
      読点: 'black',
      空白: 'white',
      Symbol: '#a69425',
      Number: '#007bbb',
      助数詞: '#fddea5',
      助助数詞: '#595857',
      冠数詞: '#393f4c'
    }
    this.bgColor = colors[this.pos] || 'black'
  }
}
</script>

<style lang="scss" scoped>
.highlighter {
  background: black;
  height: 5px;
  border-radius: 5px;
}
</style>
