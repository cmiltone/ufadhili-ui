<template>
  <v-sheet class="pa-2">
    <v-row>
      <v-col>
        <h3>System Summary</h3>
      </v-col>
    </v-row>
    <v-row align="center" justify="center">
      <v-col
        v-for="(card, i) in cards"
        :key="i"
        cols="auto"
      >
        <v-card
          class="mx-auto ma-2"
          width="250"
          :color="card.color"
          :variant="`outlined`"
        >
          <v-card-item>
            <div>
              <div class="text-h6 mb-1">
                {{ card.text }}
              </div>
              <div class="text-caption">{{ card.title }}</div>
            </div>
          </v-card-item>

          <v-card-actions>
            <v-btn :to="card.link">
              View
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-sheet>
</template>
<script lang="ts">
  export default {
    name: 'Dashboard',
    data: () => ({
      cards: [
        {
          color: 'primary',
          variant: 'outlined',
          text: 200,
          title: 'Campaigns',
          link: '/campaigns'
        },
        {
          color: 'primary',
          variant: 'outlined',
          text: 'KES 205200',
          title: 'In Payments Processed',
          link: '/payments'
        },
        // {
        //   color: 'primary',
        //   variant: 'outlined',
        //   text: 2100,
        //   title: 'Users',
        //   link: '/users'
        // },
      ]
    }) 
  }
</script>