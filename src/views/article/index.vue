<template>
  <div class="view">

    <div v-show="article == null">
      <Loading />
    </div>
    <div class="" id="gdt" @click="toTop">
      <a href="" class="scroll"></a>
    </div>

    <div class="view-header">
      <div class="view-title">
        <span style="text-align: center;">{{article.articleTitle}}</span>
        <div class="view-dateTime">
          Create at {{article.createTime}}
        </div>
      </div><img :src="article.articleCover" alt="">
    </div>

    <div class="article-directory" v-show="directory">
      <div v-html="point" id="point"></div>
    </div>

    <div class="view-content ">
      <hr>
      <div v-highlight class="view-arti " id="knowei-mark" v-html="article.articleBodyVo.content">
      </div>
      <hr />
    </div>

    <!-- 评论写入滴滴滴滴 -->
    <div class="view-comments">
      <div class="comment-header">
        <div class="comment-title">
          <span>评论区</span>
        </div>
        <div class="commit">
          <div class="commit-info">
            <input type="text" v-model="QQinputData" placeholder="QQ(必填)">
            <input type="text" placeholder="email(选填)">
            <input type="text" placeholder="https(选填)">
          </div>
          <div class="commit-canti">
            <textarea placeholder="欢迎留言" v-model="commentParams.content" style="width:100%;height:100%;"></textarea>
          </div>
          <div class="commit-submit">
            <span @click="submitInfo()">提交</span>
          </div>
        </div>

        <!-- 小伙伴评论地方 -->
        <div class="friend">
          <div class="friend-container" v-for="(item, index) in articleComment" :key="index">
            <div>
              <img :src="item.authorImg" alt="">
            </div>
            <!-- <div class="friend-title"> -->
            <div class="friend-info">
              <div class="friend-nickname">{{item.commentUsername}} <svg class="icon" aria-hidden="true">
                  <use
                    :xlink:href="item.commentUsername == 'K-No-Wei' ? '#icon-ic_userlevel_5': '#icon-ic_userlevel_4'">
                  </use>
                </svg><span style="cursor: pointer;color:#1a416b;font-weight: 600;"
                  @click="showDetails(item._id, index)">回复</span></div>
              <div class="friend-time">{{item.ctime}}</div>
              <!-- 评论内容 -->
              <div class="friend-msg">{{item.content}}</div>
              <!-- 子评论 -->
              <div>
                <div v-for="(it,ind) in item.childrens" :key="ind">
                  <div>
                    <img :src="it.authorImg" alt="">
                  </div>
                  <!-- <div class="friend-title"> -->
                  <div class="friend-child">
                    <div class="friend-nickname">{{it.commentUsername}}<svg class="icon" aria-hidden="true">
                        <use xlink:href="#icon-ic_userlevel_5"></use>
                      </svg> <span style="cursor: pointer;"></span></div>

                    <div class="friend-time">{{it.ctime}}</div>
                    <!-- 评论内容 -->
                    <div class="friend-msg" style="border: 0;!important">{{it.content}}</div>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </div>

  </div>
</template>

<script>
import $ from 'jquery'
import "@/assets/js/comment.js"
import message from "@/assets/js/message";
import { getArticle } from "@/api/article"
import { Comment, GetComment, GetAv } from "@/api/comment"
import { marked } from 'marked'
import Loading from '@/components/loading/loading.vue';
import "@/assets/js/listLoading"
export default {
  meta: {
    index: 7
  },
  components: {
    Loading
  },
  data() {
    return {
      //文章目录
      icon: '#icon-ic_userlevel_5',
      comment: {
        QQinputData: ''
      },

      point: ' ',
      directory: true,
      QQstatus: false,
      QQinputData: '',
      timer: 0,
      article: '',
      QQ: '',
      email: '',
      ipAdd: '',
      img: '',
      name: '',
      commentParams: {
        usernameId: '',
        commentUsername: '',
        content: '',
        articleId: '',
        parentId: '',
        authorImg: ''
      },
      articleComment: ''
    }
  },
  methods: {
    //返回顶部
    toTop() {
      let timer = -1
      let scrollTo = document.documentElement.scrollTop || document.body.scrollTop
      if (timer === -1) {
        timer = setInterval(() => {
          scrollTo -= 100
          if (scrollTo <= 0) {
            scrollTo = 0
            window.clearInterval(timer)
            timer = -1
          }
          window.scrollTo(0, scrollTo)
        }, 10);
      }
    },
    msg(value) {
      var QQtest = /^[1-9][0-9]{4,10}$/
      if (!QQtest.test(value)) {
        message.run("QQ格式错误", "error")
        // this.QQstatus = false
      } else {
        this.QQstatus = true
        GetAv(value).then(res => {
          this.commentParams.commentUsername = res.data.data.name
          this.commentParams.authorImg = res.data.data.avatar
          this.QQinputData = res.data.data.name
        })
      }
    },
    // 根据id获取文章详情
    getArticle() {
      let id = this.$route.params.id
      getArticle(id).then(res => {
        if (res.data.code === 200) {
          this.article = res.data.data;
          // md格式渲染在页面
          this.article.articleBodyVo.content = marked(res.data.data.articleBodyVo.content)
        }



      })
    },
    submitInfo() {

      if (this.QQstatus == false)
        return;
      this.commentParams.articleId = this.$route.params.id
      console.log(this.commentParams)
      Comment(this.commentParams).then(res => {
        if (res.data.code === 200) {
          message.run("评论成功", "success")
          this.commentParams.parentId = ''
          this.commentParams.content = ''
          this.QQ = ''
          this.getAllComment()
        }
      })
    },
    getAllComment() {
      let id = this.$route.params.id
      GetComment(id).then(res => {
        if (res.data.code === 200) {
          this.articleComment = res.data.data
          console.log(this.articleComment)
        }
      })
    },
    showDetails(id, textid) {
      var el = document.getElementsByClassName("comment-submit")[0]
      this.$nextTick(function () {
        window.scrollTo({ "behavior": "smooth", "top": el.offsetTop - 100 });
      })
      this.commentParams.parentId = id
      this.commentParams.content = '@' + this.articleComment[textid].commentUsername + "    "
    }
  },
  //监听数据变换
  watch: {
    QQinputData(value) {
      if (this.timer === 0) {
        this.timer = setTimeout(() => {
          //  this.GetValue()
          this.msg(value)
        }, 1000)
      } else {
        clearTimeout(this.timer)
        this.timer = setTimeout(() => {
          //  this.GetValue()
          this.msg(value)
        }, 1000)
      }

    }
  },
  created() {
    this.getArticle()
    this.getAllComment()
    this.getImages()
  }
}
</script>

<style lang="less" scoped>
@import url("@/assets/css/new-article.css");
@import url("@/assets/css/message.css");

.view-header {
  position: relative;
  height: 400px;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
  }

  .view-title {
    font-family: "MYTTF";
    position: absolute;
    max-width: 70%;
    left: 50%;
    bottom: 20%;
    transform: translate(-50%);
    text-shadow: 0 3px 6px rgb(0 0 0 / 30%);

    span {

      font-size: 36px;
      color: #fff;
      font-weight: 800;
      letter-spacing: 3px;
      text-shadow: 0 3px 6px rgb(0 0 0 / 30%);
    }

    .view-dateTime {
      margin-top: 15px;
      color: #fff;
      font-size: 25px;
      text-shadow: 0 3px 6px rgb(0 0 0 / 30%);
    }
  }
}

.article-directory {
  z-index: 10;
  top: 10px;
  margin-top: 100px;
  // box-shadow: 1px 0px 10px 10px #a1a0a082;
  background: rgb(245, 244, 244);
  position: fixed;
  max-width: 33%;
  border-radius: 10px;
  right: 0;
  transition: all 0.9s;

  h1 {
    font-size: 10px;
  }

  #point {

    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
      padding: 5px 0;
      cursor: pointer;
      transition: all 0.9s;
    }

    h1:hover,
    h2:hover,
    h3:hover,
    h4:hover,
    h5:hover,
    h6:hover {
      padding-left: 4px;
      text-decoration: underline;
    }

  }

  #point h1 {
    font-size: 16px;
    border: 0 !important;

  }

  #point h2 {
    font-size: 16px;
    margin-left: 5px;
    border: 0 !important;
  }

  #point h3 {
    font-size: 16px;
    margin-left: 15px;
    border: 0 !important;
  }

  #point h4 {
    font-size: 16px;
    margin-left: 25px;
    border: 0 !important;
  }

  #point h5 {
    font-size: 16px;
    margin-left: 35px;
    border: 0 !important;
  }

}

.view-content {
  margin-top: 20px;
  padding-bottom: 50px;
  background: rgba(255, 255, 255, 0.443);
  padding-top: 50px;
  position: relative;
  max-width: 70%;
  margin-left: auto;
  margin-right: auto;
  animation: header-menu 1.8s;
  transition: all .4s ease !important;
  // box-shadow: 1px 0px 10px 10px #a1a0a082;
  border-radius: 10px;

  hr {
    margin: 10px auto 0;
    width: 96%;
    border: 1px dashed #ececec;
  }

  .view-arti {}
}

.view {
  // background: url(https://api.yimian.xyz/img);
  background-position: center center;
  repeat: no-repeat;
  background-attachment: fixed;
  filter: progid:DXImageTransform.Microsoft.AlphaImageLoader(src='images/background.jpg', sizingMethod='scale');
  -ms-filter: progid:DXImageTransform.Microsoft.AlphaImageLoader(src='images/background.jpg', sizingMethod='scale');
  background-size: cover;
  -moz-background-size: cover;
  -webkit-background-size: cover;
}

.view-comments {
  background: rgb(255, 255, 255);
  margin-top: 10px;
  padding-bottom: 30px;
  // box-shadow: 1px 0px 10px 10px #a1a0a082;
  border-radius: 10px;
  max-width: 76%;
  margin-left: auto;
  margin-right: auto;

  .comment-header {

    padding: 10px 30px 0;

    .comment-title {
      // border-bottom: 1px solid rgba(0, 0, 0, 0.494);
      padding-bottom: 10px;

      span {
        font-size: 20px;
        font-weight: 700;
        letter-spacing: 5px;
      }
    }

    .commit {
      padding: 10px 0;
      // margin-top: 2px;
      border: 1px solid rgb(187, 183, 183);
      border-radius: 5px;

      .commit-info {
        display: flex;
        line-height: 1.75px;
        height: 50px;
        border-bottom: 1px dashed rgb(169, 162, 162);
        margin: 0 10px 40px;

        input {
          width: 32%;
          outline: none;
          border: 0px;
          font-weight: 300;
        }

      }

      .commit-canti {
        margin: 0 10px 2px;
        height: 200px;

        textarea {
          border: 0px;
          outline: none;
        }

      }

      .commit-submit {
        margin: 0 10px;
        text-align: right;

        span {
          padding: 5px 15px;
          border: 1px solid rgb(51, 51, 51);
          border-radius: 5px;
          right: 0;
          display: inline-block;
          font-size: 14px;
          cursor: pointer;

        }
      }
    }

  }


}

.protools {
  position: fixed;
  right: 40px;
  bottom: 60px;
  z-index: 10;

  li {
    margin: 40px 0;
    list-style: none;
    background: rgb(221, 226, 227);
    padding: 10px;
    border-radius: 100%;

    svg {
      height: 25px;
      width: 30px;
    }

    cursor: pointer;
    box-shadow: 1px 0px 5px 5px #dbdbdbe9;
  }
}

// 小伙伴的评论区
.friend {

  svg {
    margin: 0 2px -7px;
    height: 25px;
    width: 25px;
    align-content: center;

  }

  padding: 10px 10px;

  img {
    height: 50px;
    width: 50px;
    border-radius: 100%;
    margin-top: 10px;
    float: left;
  }

  .friend-child {
    margin-left: 60px;
  }

  .friend-container {
    padding-top: 30px;

    .friend-info {
      margin-left: 60px;
      display: block;
      border-bottom: 1px solid rgba(185, 184, 184, 0.766);

      div {
        display: list-item;
        list-style: none;
      }
    }


    .friend-nickname {
      font-size: 14px;
      line-height: 1.5;
      font-weight: 500;
      color: #344951;

      a {
        text-decoration: none;
        color: rgb(16, 130, 168);
        font-weight: 600;
      }
    }

    .friend-time {
      font-size: .75em;
      margin-right: .875em;
    }

    .friend-msg {
      padding: 10px 0 20px;
      color: rgba(34, 32, 32, 0.633);
      font-size: 15px;
    }

  }
}

/**.scro显示动画效果 */
.scro {
  z-index: 10;
  clear: both;
  position: fixed;
  right: 7%;
  width: 70px;
  height: 900px;
  cursor: pointer;
  background: url("@/assets/img/scroll.png");
  animation: myAnimation 1s linear forwards;
}

/**.guanbi隐藏动画 */
.guanbi {
  z-index: 10;
  clear: both;
  position: fixed;
  right: 7%;
  width: 70px;
  height: 900px;
  cursor: pointer;
  background: url("@/assets/img/scroll.png");
  animation: guanbi 1s linear forwards;
}

@keyframes myAnimation {
  from {
    transform: translate(0, -900px);
  }

  to {
    transform: translate(0, 0);
  }
}

@keyframes guanbi {
  from {
    transform: translate(0, 0);
  }

  to {
    transform: translate(0, -900px);
  }
}
</style>